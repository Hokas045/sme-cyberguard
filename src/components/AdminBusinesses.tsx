"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  Trash2,
  Star,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { query, update } from '@/lib/turso';
import { useCurrency } from '@/hooks/useCurrency';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  subscription_status: string;
  subscription_tier?: string;
  created_at: string;
  trial_ends_at?: string;
  last_payment_date?: string;
  total_revenue: number;
  device_count: number;
  user_count: number;
  status: 'active' | 'suspended' | 'deleted';
}

const AdminBusinesses = () => {
  const { code: currencyCode, convertFromUSD } = useCurrency();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'suspend' | 'delete' | 'upgrade' | null;
    business: Business | null;
  }>({ open: false, action: null, business: null });

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);

      // Get all businesses with their stats
      const businessesResult = await query(`
        SELECT
          b.id,
          b.name,
          b.email,
          b.phone,
          b.country,
          b.subscription_status,
          b.subscription_tier,
          b.created_at,
          b.trial_ends_at,
          b.status,
          COALESCE(SUM(pt.amount_usd), 0) as total_revenue,
          COUNT(DISTINCT d.id) as device_count,
          COUNT(DISTINCT u.id) as user_count,
          MAX(pt.created_at) as last_payment_date
        FROM businesses b
        LEFT JOIN payment_transactions pt ON b.id = pt.business_id AND pt.status = 'success'
        LEFT JOIN devices d ON b.id = d.business_id
        LEFT JOIN users u ON b.id = u.business_id
        GROUP BY b.id, b.name, b.email, b.phone, b.country, b.subscription_status,
                 b.subscription_tier, b.created_at, b.trial_ends_at, b.status
        ORDER BY b.created_at DESC
      `);

      const businessesData: Business[] = businessesResult.map(business => ({
        id: String(business.id),
        name: String(business.name),
        email: String(business.email),
        phone: business.phone ? String(business.phone) : undefined,
        country: String(business.country),
        subscription_status: String(business.subscription_status),
        subscription_tier: business.subscription_tier ? String(business.subscription_tier) : undefined,
        created_at: String(business.created_at),
        trial_ends_at: business.trial_ends_at ? String(business.trial_ends_at) : undefined,
        last_payment_date: business.last_payment_date ? String(business.last_payment_date) : undefined,
        total_revenue: Number(business.total_revenue),
        device_count: Number(business.device_count),
        user_count: Number(business.user_count),
        status: String(business.status) as 'active' | 'suspended' | 'deleted'
      }));

      setBusinesses(businessesData);
    } catch (error) {
      console.error('Failed to load businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || business.subscription_status === statusFilter;
    const matchesTier = tierFilter === 'all' || business.subscription_tier === tierFilter;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const handleAction = async (action: 'suspend' | 'delete' | 'upgrade', business: Business) => {
    try {
      switch (action) {
        case 'suspend':
          await update('businesses', { status: 'suspended' }, { id: business.id });
          break;
        case 'delete':
          await update('businesses', { status: 'deleted' }, { id: business.id });
          break;
        case 'upgrade':
          // Upgrade to Professional tier
          await update('businesses', {
            subscription_tier: 'professional',
            subscription_status: 'active'
          }, { id: business.id });
          break;
      }

      await loadBusinesses(); // Refresh the list
      setActionDialog({ open: false, action: null, business: null });
    } catch (error) {
      console.error(`Failed to ${action} business:`, error);
    }
  };

  const getStatusBadge = (status: string, subscriptionStatus: string) => {
    if (status === 'suspended') {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (status === 'deleted') {
      return <Badge variant="outline">Deleted</Badge>;
    }

    switch (subscriptionStatus) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-orange-100 text-orange-800">Past Due</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{subscriptionStatus}</Badge>;
    }
  };

  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case 'professional':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'starter':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <Building className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Management</h1>
          <p className="text-muted-foreground">
            Manage all businesses on the platform
          </p>
        </div>
        <Button onClick={loadBusinesses} variant="outline">
          <Building className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Businesses</p>
                <p className="text-2xl font-bold">{businesses.length}</p>
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
                <p className="text-2xl font-bold">
                  {businesses.filter(b => b.subscription_status === 'active').length}
                </p>
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
                <p className="text-2xl font-bold">
                  {currencyCode} {convertFromUSD(businesses.reduce((sum, b) => sum + b.total_revenue, 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold">
                  {businesses.reduce((sum, b) => sum + b.device_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Business Table */}
      <Card>
        <CardHeader>
          <CardTitle>Businesses ({filteredBusinesses.length})</CardTitle>
          <CardDescription>
            Complete list of all businesses on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{business.name}</div>
                      <div className="text-sm text-muted-foreground">{business.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(business.status, business.subscription_status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTierIcon(business.subscription_tier)}
                      <span className="capitalize">{business.subscription_tier || 'Free'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {currencyCode} {convertFromUSD(business.total_revenue).toLocaleString()}
                  </TableCell>
                  <TableCell>{business.device_count}</TableCell>
                  <TableCell>{business.user_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {business.country}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(business.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setSelectedBusiness(business)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {business.subscription_tier !== 'professional' && (
                          <DropdownMenuItem
                            onClick={() => setActionDialog({
                              open: true,
                              action: 'upgrade',
                              business
                            })}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Professional
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setActionDialog({
                            open: true,
                            action: 'suspend',
                            business
                          })}
                          className="text-orange-600"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Suspend Account
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setActionDialog({
                            open: true,
                            action: 'delete',
                            business
                          })}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'suspend' && 'Suspend Business Account'}
              {actionDialog.action === 'delete' && 'Delete Business Account'}
              {actionDialog.action === 'upgrade' && 'Upgrade to Professional'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'suspend' && (
                <>Are you sure you want to suspend {actionDialog.business?.name}? This will temporarily disable their access to the platform.</>
              )}
              {actionDialog.action === 'delete' && (
                <>Are you sure you want to delete {actionDialog.business?.name}? This action cannot be undone and will permanently remove all their data.</>
              )}
              {actionDialog.action === 'upgrade' && (
                <>Upgrade {actionDialog.business?.name} to Professional tier? This will activate premium features immediately.</>
              )}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.action === 'delete' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action is irreversible. All business data, devices, and user accounts will be permanently deleted.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, action: null, business: null })}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === 'delete' ? 'destructive' : 'default'}
              onClick={() => actionDialog.business && handleAction(actionDialog.action!, actionDialog.business)}
            >
              {actionDialog.action === 'suspend' && 'Suspend Account'}
              {actionDialog.action === 'delete' && 'Delete Account'}
              {actionDialog.action === 'upgrade' && 'Upgrade Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Business Details Modal */}
      {selectedBusiness && (
        <Dialog open={!!selectedBusiness} onOpenChange={() => setSelectedBusiness(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {selectedBusiness.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedBusiness.email}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedBusiness.phone || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedBusiness.country}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(selectedBusiness.created_at)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">
                      {currencyCode} {convertFromUSD(selectedBusiness.total_revenue).toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{selectedBusiness.device_count}</div>
                    <p className="text-sm text-muted-foreground">Devices</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">{selectedBusiness.user_count}</div>
                    <p className="text-sm text-muted-foreground">Users</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminBusinesses;