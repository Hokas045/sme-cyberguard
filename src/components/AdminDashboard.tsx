"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  CreditCard,
  Activity,
  PieChart,
  Download as DownloadIcon,
  Monitor,
  Apple,
  Server
} from 'lucide-react';
import { query } from '@/lib/turso';
import { useCurrency } from '@/hooks/useCurrency';

interface SystemStats {
  totalBusinesses: number;
  activeSubscriptions: number;
  totalRevenue: number;
  trialConversions: number;
  paymentSuccessRate: number;
  avgRevenuePerBusiness: number;
  topCountries: Array<{ country: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  subscriptionTiers: Array<{ tier: string; count: number; percentage: number }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
  downloadStats: {
    totalDownloads: number;
    downloadsByPlatform: Array<{ platform: string; count: number }>;
    downloadsByCountry: Array<{ country: string; count: number }>;
    downloadsByMonth: Array<{ month: string; count: number }>;
    recentDownloads: Array<{
      platform: string;
      country: string;
      business_name?: string;
      timestamp: string;
    }>;
  };
}

const AdminDashboard = () => {
  const navigate = useRouter();
  const { code: currencyCode, convertFromUSD } = useCurrency();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Check admin authentication
  useEffect(() => {
    const adminToken = sessionStorage.getItem('admin_token');
    const adminData = sessionStorage.getItem('admin_data');

    if (!adminToken || !adminData) {
      router.push('/admin/login');
      return;
    }

    loadSystemStats();
  }, [timeRange]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_data');
    router.push('/admin/login');
  };

  const loadSystemStats = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get total businesses
      const businessesResult = await query('SELECT COUNT(*) as count FROM businesses');
      const totalBusinesses = Number(businessesResult[0].count);

      // Get active subscriptions
      const subscriptionsResult = await query(
        "SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'"
      );
      const activeSubscriptions = Number(subscriptionsResult[0].count);

      // Get total revenue (from successful payments)
      const revenueResult = await query(
        'SELECT SUM(amount_usd) as total FROM payment_transactions WHERE status = "success"'
      );
      const totalRevenue = Number(revenueResult[0].total || 0);

      // Get trial conversions
      const conversionsResult = await query(
        'SELECT COUNT(*) as count FROM subscription_trials WHERE converted_to_paid = 1'
      );
      const trialConversions = Number(conversionsResult[0].count);

      // Get payment success rate
      const paymentStatsResult = await query(`
        SELECT
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
          COUNT(*) as total
        FROM payment_transactions
      `);
      const successful = Number(paymentStatsResult[0].successful);
      const total = Number(paymentStatsResult[0].total);
      const paymentSuccessRate = total > 0 ? (successful / total) * 100 : 0;

      // Get top countries
      const countriesResult = await query(`
        SELECT country, COUNT(*) as count
        FROM businesses
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
      `);

      // Get revenue by month (last 12 months)
      const revenueByMonthResult = await query(`
        SELECT
          strftime('%Y-%m', created_at) as month,
          SUM(amount_usd) as revenue
        FROM payment_transactions
        WHERE status = 'success' AND created_at >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month DESC
      `);

      // Get subscription tiers distribution
      const tiersResult = await query(`
        SELECT
          pt.tier_code as tier,
          COUNT(s.id) as count
        FROM pricing_tiers pt
        LEFT JOIN subscriptions s ON pt.id = s.pricing_tier_id AND s.status = 'active'
        GROUP BY pt.id, pt.tier_code
      `);

      // Calculate percentages for tiers
      const totalActiveSubs = tiersResult.reduce((sum, tier) => sum + Number(tier.count), 0);
      const subscriptionTiers = tiersResult.map(tier => ({
        tier: String(tier.tier),
        count: Number(tier.count),
        percentage: totalActiveSubs > 0 ? (Number(tier.count) / totalActiveSubs) * 100 : 0
      }));

      // Get download statistics
      const totalDownloadsResult = await query('SELECT COUNT(*) as count FROM agent_downloads');
      const totalDownloads = Number(totalDownloadsResult[0].count);

      const downloadsByPlatformResult = await query(`
        SELECT platform, COUNT(*) as count
        FROM agent_downloads
        GROUP BY platform
        ORDER BY count DESC
      `);

      const downloadsByCountryResult = await query(`
        SELECT country, COUNT(*) as count
        FROM agent_downloads
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
      `);

      const downloadsByMonthResult = await query(`
        SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
        FROM agent_downloads
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month DESC
        LIMIT 12
      `);

      const recentDownloadsResult = await query(`
        SELECT
          ad.platform,
          ad.country,
          b.name as business_name,
          ad.created_at
        FROM agent_downloads ad
        LEFT JOIN businesses b ON ad.business_id = b.id
        ORDER BY ad.created_at DESC
        LIMIT 10
      `);

      // Get recent activity (last 10 events from audit logs)
      const activityResult = await query(`
        SELECT event_type, event_data, created_at
        FROM audit_logs
        WHERE event_type IN ('subscription_activated', 'payment_failed', 'webhook_received')
        ORDER BY created_at DESC
        LIMIT 10
      `);

      const recentActivity = activityResult.map(activity => {
        let description = '';
        let amount: number | undefined;

        try {
          const data = JSON.parse(String(activity.event_data));
          switch (String(activity.event_type)) {
            case 'subscription_activated':
              description = `New subscription activated (${data.tier_id})`;
              amount = data.amount;
              break;
            case 'payment_failed':
              description = `Payment failed (${data.reference})`;
              break;
            case 'webhook_received':
              description = `Payment webhook processed`;
              break;
            default:
              description = String(activity.event_type);
          }
        } catch {
          description = String(activity.event_type);
        }

        return {
          type: String(activity.event_type),
          description,
          timestamp: String(activity.created_at),
          amount
        };
      });

      setStats({
        totalBusinesses,
        activeSubscriptions,
        totalRevenue,
        trialConversions,
        paymentSuccessRate,
        avgRevenuePerBusiness: totalBusinesses > 0 ? totalRevenue / totalBusinesses : 0,
        topCountries: countriesResult.map(c => ({
          country: String(c.country),
          count: Number(c.count)
        })),
        revenueByMonth: revenueByMonthResult.map(r => ({
          month: String(r.month),
          revenue: Number(r.revenue)
        })),
        subscriptionTiers,
        recentActivity,
        downloadStats: {
          totalDownloads,
          downloadsByPlatform: downloadsByPlatformResult.map(d => ({
            platform: String(d.platform),
            count: Number(d.count)
          })),
          downloadsByCountry: downloadsByCountryResult.map(d => ({
            country: String(d.country),
            count: Number(d.count)
          })),
          downloadsByMonth: downloadsByMonthResult.map(d => ({
            month: String(d.month),
            count: Number(d.count)
          })),
          recentDownloads: recentDownloadsResult.map(d => ({
            platform: String(d.platform),
            country: String(d.country),
            business_name: d.business_name ? String(d.business_name) : undefined,
            timestamp: String(d.created_at)
          }))
        }
      });
    } catch (error) {
      console.error('Failed to load system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${currencyCode} ${convertFromUSD(amount).toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Unable to Load Statistics</h3>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-muted-foreground">
            Platform-wide statistics and monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">
              {(() => {
                try {
                  const adminData = JSON.parse(sessionStorage.getItem('admin_data') || '{}');
                  return adminData.name || 'Admin';
                } catch {
                  return 'Admin';
                }
              })()}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Businesses</p>
                <p className="text-2xl font-bold">{stats.totalBusinesses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.paymentSuccessRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Subscription Tiers Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Subscription Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.subscriptionTiers.map((tier) => (
                    <div key={tier.tier} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{tier.tier}</span>
                        <span>{tier.count} ({tier.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={tier.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topCountries.slice(0, 8).map((country) => (
                    <div key={country.country} className="flex justify-between">
                      <span className="text-sm">{country.country}</span>
                      <Badge variant="outline">{country.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {stats.trialConversions}
                </div>
                <p className="text-sm text-muted-foreground">Trial Conversions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCurrency(stats.avgRevenuePerBusiness)}
                </div>
                <p className="text-sm text-muted-foreground">Avg Revenue/Business</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {((stats.activeSubscriptions / stats.totalBusinesses) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="businesses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Statistics</CardTitle>
              <CardDescription>
                Aggregated business metrics (no individual data shown)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{stats.totalBusinesses}</div>
                  <p className="text-sm text-muted-foreground">Total Registered</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{stats.activeSubscriptions}</div>
                  <p className="text-sm text-muted-foreground">Active Subscribers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {stats.totalBusinesses - stats.activeSubscriptions}
                  </div>
                  <p className="text-sm text-muted-foreground">On Trial/Free</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {stats.topCountries.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Countries Served</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{formatCurrency(stats.avgRevenuePerBusiness)}</div>
                    <p className="text-sm text-muted-foreground">Average per Business</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{stats.paymentSuccessRate.toFixed(1)}%</div>
                    <p className="text-sm text-muted-foreground">Payment Success Rate</p>
                  </div>
                </div>

                {/* Monthly Revenue Chart Placeholder */}
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Revenue Trend (Last 12 Months)</h4>
                  <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Revenue chart visualization</p>
                      <p className="text-sm">Monthly data available in stats object</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DownloadIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Downloads</p>
                    <p className="text-2xl font-bold">{stats.downloadStats.totalDownloads.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Monitor className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Windows Downloads</p>
                    <p className="text-2xl font-bold">
                      {stats.downloadStats.downloadsByPlatform.find(p => p.platform === 'windows')?.count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Apple className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">macOS Downloads</p>
                    <p className="text-2xl font-bold">
                      {stats.downloadStats.downloadsByPlatform.find(p => p.platform === 'macos')?.count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Server className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Linux Downloads</p>
                    <p className="text-2xl font-bold">
                      {stats.downloadStats.downloadsByPlatform.find(p => p.platform === 'linux')?.count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Downloads by Platform */}
            <Card>
              <CardHeader>
                <CardTitle>Downloads by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.downloadStats.downloadsByPlatform.map((platform) => (
                    <div key={platform.platform} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {platform.platform === 'windows' && <Monitor className="h-4 w-4" />}
                        {platform.platform === 'macos' && <Apple className="h-4 w-4" />}
                        {platform.platform === 'linux' && <Server className="h-4 w-4" />}
                        <span className="capitalize">{platform.platform}</span>
                      </div>
                      <Badge variant="outline">{platform.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Downloads by Country */}
            <Card>
              <CardHeader>
                <CardTitle>Downloads by Country</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.downloadStats.downloadsByCountry.slice(0, 10).map((country) => (
                    <div key={country.country} className="flex justify-between">
                      <span>{country.country}</span>
                      <Badge variant="outline">{country.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Downloads */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Downloads</CardTitle>
              <CardDescription>Latest agent downloads across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.downloadStats.recentDownloads.map((download, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {download.platform === 'windows' && <Monitor className="h-4 w-4" />}
                          {download.platform === 'macos' && <Apple className="h-4 w-4" />}
                          {download.platform === 'linux' && <Server className="h-4 w-4" />}
                          <span className="capitalize">{download.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>{download.business_name || 'Anonymous'}</TableCell>
                      <TableCell>{download.country}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(download.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent System Activity
              </CardTitle>
              <CardDescription>
                Latest platform events and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentActivity.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge
                          variant={
                            activity.type === 'subscription_activated' ? 'default' :
                            activity.type === 'payment_failed' ? 'destructive' : 'secondary'
                          }
                        >
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>
                        {activity.amount ? formatCurrency(activity.amount) : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;