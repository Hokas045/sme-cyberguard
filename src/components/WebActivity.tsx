"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Globe,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Trash2,
  Calendar,
  Monitor,
  Shield,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { query } from "@/lib/turso";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WebActivityData {
  id: string;
  device_id: string;
  hostname: string;
  domain: string;
  action: "blocked" | "allowed";
  threat_type: string;
  detected_at: string;
  user_warned: boolean;
}

interface BlockedDomainData {
  id: string;
  domain: string;
  reason: string;
  added_at: string;
  added_by: string;
}

interface SummaryData {
  total_blocked: number;
  unique_domains: number;
  blocked_over_time: number;
}

interface TopDomainData {
  domain: string;
  attempts: number;
}

interface DeviceOption {
  id: string;
  hostname: string;
}

const WebActivity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const businessId = user?.business_id;

  // Filter states
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7"); // days
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Dialog states
  const [addDomainOpen, setAddDomainOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newDomainReason, setNewDomainReason] = useState("");

  // Fetch summary data with 60s polling
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useQuery({
    queryKey: ['web-activity-summary', businessId, dateFilter],
    queryFn: async (): Promise<SummaryData> => {
      if (!businessId) throw new Error('No business ID');

      const days = parseInt(dateFilter);
      const dateFilterStr = `datetime('now', '-${days} days')`;

      const result = await query(`
        SELECT
          COUNT(CASE WHEN action = 'blocked' THEN 1 END) as total_blocked,
          COUNT(DISTINCT domain) as unique_domains,
          COUNT(CASE WHEN action = 'blocked' AND detected_at > ${dateFilterStr} THEN 1 END) as blocked_over_time
        FROM web_threats
        WHERE business_id = ?
      `, [businessId]);

      return result[0] as SummaryData;
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch top blocked domains for chart
  const { data: topDomains, isLoading: topDomainsLoading, isError: topDomainsError } = useQuery({
    queryKey: ['top-blocked-domains', businessId, dateFilter],
    queryFn: async (): Promise<TopDomainData[]> => {
      if (!businessId) return [];

      const days = parseInt(dateFilter);
      const dateFilterStr = `datetime('now', '-${days} days')`;

      const result = await query(`
        SELECT
          domain,
          COUNT(*) as attempts
        FROM web_threats
        WHERE business_id = ? AND action = 'blocked' AND detected_at > ${dateFilterStr}
        GROUP BY domain
        ORDER BY attempts DESC
        LIMIT 10
      `, [businessId]);

      return result as TopDomainData[];
    },
    refetchInterval: 60000,
    enabled: !!businessId
  });

  // Fetch web activity with filters and 60s polling
  const { data: webActivity, isLoading: activityLoading, isError: activityError } = useQuery({
    queryKey: ['web-activity', businessId, deviceFilter, dateFilter],
    queryFn: async (): Promise<WebActivityData[]> => {
      if (!businessId) return [];

      const days = parseInt(dateFilter);
      const dateFilterStr = `datetime('now', '-${days} days')`;

      let sql = `
        SELECT
          w.id,
          w.device_id,
          d.hostname,
          w.domain,
          w.action,
          w.threat_type,
          w.detected_at,
          w.user_warned
        FROM web_threats w
        JOIN devices d ON w.device_id = d.id
        WHERE w.business_id = ? AND w.detected_at > ${dateFilterStr}
      `;

      const params: any[] = [businessId];

      // Device filter
      if (deviceFilter !== "all") {
        sql += " AND w.device_id = ?";
        params.push(deviceFilter);
      }

      sql += " ORDER BY w.detected_at DESC";

      const result = await query(sql, params);
      return result as WebActivityData[];
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch devices for dropdown
  const { data: devices } = useQuery({
    queryKey: ['devices-options', businessId],
    queryFn: async (): Promise<DeviceOption[]> => {
      if (!businessId) throw new Error('No business ID');
      const result = await query(
        'SELECT id, hostname FROM devices WHERE business_id = ? ORDER BY hostname',
        [businessId]
      );
      return result as DeviceOption[];
    },
    enabled: !!businessId
  });

  // Fetch custom blocked domains
  const { data: blockedDomains, isLoading: blockedDomainsLoading, isError: blockedDomainsError } = useQuery({
    queryKey: ['blocked-domains', businessId],
    queryFn: async (): Promise<BlockedDomainData[]> => {
      if (!businessId) return [];
      const result = await query(
        'SELECT id, domain, reason, added_at, added_by FROM business_blocked_domains WHERE business_id = ? ORDER BY added_at DESC',
        [businessId]
      );
      return result as BlockedDomainData[];
    },
    refetchInterval: 60000,
    enabled: !!businessId
  });

  // Mutation for adding blocked domain
  const addDomainMutation = useMutation({
    mutationFn: async ({ domain, reason }: { domain: string; reason: string }) => {
      await query(
        'INSERT INTO business_blocked_domains (id, business_id, domain, reason, added_by) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), businessId, domain, reason, user?.email || 'unknown']
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-domains'] });
      toast({
        title: "Success",
        description: "Domain added to blocked list",
      });
      setAddDomainOpen(false);
      setNewDomain("");
      setNewDomainReason("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add domain",
        variant: "destructive",
      });
    }
  });

  // Mutation for removing blocked domain
  const removeDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      await query(
        'DELETE FROM business_blocked_domains WHERE id = ? AND business_id = ?',
        [domainId, businessId]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-domains'] });
      toast({
        title: "Success",
        description: "Domain removed from blocked list",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove domain",
        variant: "destructive",
      });
    }
  });

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain) && domain.length <= 253;
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) {
      toast({
        title: "Error",
        description: "Domain is required",
        variant: "destructive",
      });
      return;
    }

    if (!validateDomain(newDomain)) {
      toast({
        title: "Error",
        description: "Invalid domain format",
        variant: "destructive",
      });
      return;
    }

    addDomainMutation.mutate({ domain: newDomain, reason: newDomainReason });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-KE", {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredActivity = webActivity?.filter(activity =>
    activity.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.threat_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const hasError = summaryError || topDomainsError || activityError || blockedDomainsError;
  const isLoading = summaryLoading || activityLoading;

  if (hasError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground">Failed to load web activity data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Web Activity</h1>
          <p className="text-muted-foreground mt-1">Monitor and control web access across all devices</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocked Attempts</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_blocked || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sites blocked by security policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Domains Blocked</CardTitle>
            <Globe className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.unique_domains || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Distinct malicious domains detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts Over Time</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.blocked_over_time || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In the last {dateFilter} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Blocked Domains Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Blocked Domains</CardTitle>
          <CardDescription>Most frequently blocked domains in the last {dateFilter} days</CardDescription>
        </CardHeader>
        <CardContent>
          {topDomains && topDomains.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topDomains}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="domain"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [value, 'Attempts']}
                />
                <Bar dataKey="attempts" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No blocked domains data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search domains, devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Device</label>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Devices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {devices?.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.hostname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Activity Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Web Activity Log ({filteredActivity.length})</CardTitle>
          </div>
          <CardDescription>Real-time web access attempts - automatic updates every 60 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>URL/Domain</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Threat Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(activity.detected_at)}
                      </TableCell>
                      <TableCell>{activity.hostname}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={activity.domain}>
                        {activity.domain}
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.action === 'blocked' ? 'destructive' : 'secondary'}>
                          {activity.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.threat_type}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Web Activity</h3>
              <p className="text-muted-foreground">No web access attempts match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Blocked Domains Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Blocked Domains</CardTitle>
              <CardDescription>Manage your custom domain blocking rules</CardDescription>
            </div>
            <Dialog open={addDomainOpen} onOpenChange={setAddDomainOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Blocked Domain</DialogTitle>
                  <DialogDescription>
                    Add a domain to block across all devices in your business.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      placeholder="example.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason (Optional)</Label>
                    <Input
                      id="reason"
                      placeholder="Reason for blocking"
                      value={newDomainReason}
                      onChange={(e) => setNewDomainReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDomainOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDomain} disabled={addDomainMutation.isPending}>
                    {addDomainMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add Domain
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {blockedDomains && blockedDomains.length > 0 ? (
            <div className="space-y-4">
              {blockedDomains.map((domain) => (
                <div key={domain.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{domain.domain}</span>
                    </div>
                    {domain.reason && (
                      <p className="text-sm text-muted-foreground mt-1">{domain.reason}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Added {formatDate(domain.added_at)} by {domain.added_by}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDomainMutation.mutate(domain.id)}
                    disabled={removeDomainMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Custom Blocked Domains</h3>
              <p className="text-muted-foreground">Add domains to block across all your devices</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WebActivity;