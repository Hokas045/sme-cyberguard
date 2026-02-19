"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Usb,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Monitor,
  Shield,
  AlertTriangle,
  CheckCircle,
  HardDrive
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
import { useAuth } from "@/hooks/useAuth";
import { query } from "@/lib/turso";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface USBActivityData {
  id: string;
  device_id: string;
  hostname: string;
  drive_letter: string;
  action: "allowed" | "blocked";
  threats_found: number;
  details: string;
  detected_at: string;
}

interface SummaryData {
  total_insertions: number;
  blocked_insertions: number;
  malicious_detections: number;
}

interface ChartData {
  date: string;
  insertions: number;
}

interface DeviceOption {
  id: string;
  hostname: string;
}

const USBActivity = () => {
  const { user } = useAuth();
  const businessId = user?.business_id;

  // Filter states
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7"); // days
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch summary data with 60s polling
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['usb-activity-summary', businessId, dateFilter],
    queryFn: async (): Promise<SummaryData> => {
      if (!businessId) throw new Error('No business ID');

      const days = parseInt(dateFilter);
      const dateFilterStr = `datetime('now', '-${days} days')`;

      const result = await query(`
        SELECT
          COUNT(*) as total_insertions,
          COUNT(CASE WHEN action = 'blocked' THEN 1 END) as blocked_insertions,
          SUM(threats_found) as malicious_detections
        FROM usb_activity
        WHERE business_id = ? AND detected_at > ${dateFilterStr}
      `, [businessId]);

      return result[0] as SummaryData;
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch chart data for activity over time
  const { data: chartData, isLoading: chartLoading, error: chartError } = useQuery({
    queryKey: ['usb-activity-chart', businessId, dateFilter],
    queryFn: async (): Promise<ChartData[]> => {
      if (!businessId) return [];

      const days = parseInt(dateFilter);
      const dateFilterStr = `datetime('now', '-${days} days')`;

      const result = await query(`
        SELECT
          DATE(detected_at) as date,
          COUNT(*) as insertions
        FROM usb_activity
        WHERE business_id = ? AND detected_at > ${dateFilterStr}
        GROUP BY DATE(detected_at)
        ORDER BY date ASC
      `, [businessId]);

      return result as ChartData[];
    },
    refetchInterval: 60000,
    enabled: !!businessId
  });

  // Fetch USB activity with filters and 60s polling
  const { data: usbActivity, isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ['usb-activity', businessId, deviceFilter, dateFilter, actionFilter],
    queryFn: async (): Promise<USBActivityData[]> => {
      if (!businessId) return [];

      const days = parseInt(dateFilter);
      const dateFilterStr = `datetime('now', '-${days} days')`;

      let sql = `
        SELECT
          u.id,
          u.device_id,
          d.hostname,
          u.drive_letter,
          u.action,
          u.threats_found,
          u.details,
          u.detected_at
        FROM usb_activity u
        JOIN devices d ON u.device_id = d.id
        WHERE u.business_id = ? AND u.detected_at > ${dateFilterStr}
      `;

      const params: any[] = [businessId];

      // Device filter
      if (deviceFilter !== "all") {
        sql += " AND u.device_id = ?";
        params.push(deviceFilter);
      }

      // Action filter
      if (actionFilter !== "all") {
        sql += " AND u.action = ?";
        params.push(actionFilter);
      }

      sql += " ORDER BY u.detected_at DESC";

      const result = await query(sql, params);
      return result as USBActivityData[];
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-KE", {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredActivity = usbActivity?.filter(activity =>
    activity.drive_letter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.details.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (summaryLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (summaryError || chartError || activityError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground">Failed to load USB activity data. Please try again.</p>
        </div>
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
          <h1 className="text-3xl md:text-4xl font-bold">USB Activity</h1>
          <p className="text-muted-foreground mt-1">Monitor USB device insertions and security threats</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total USB Insertions</CardTitle>
            <HardDrive className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_insertions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              USB devices inserted in the last {dateFilter} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Insertions</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.blocked_insertions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              USB devices blocked by security policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Malicious File Detections</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.malicious_detections || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Potentially harmful files detected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>USB Activity Trends</CardTitle>
          <CardDescription>USB insertion activity over the last {dateFilter} days</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  formatter={(value: number) => [value, 'Insertions']}
                />
                <Line
                  type="monotone"
                  dataKey="insertions"
                  stroke="#0066CC"
                  strokeWidth={2}
                  dot={{ fill: '#0066CC', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No USB activity data available</p>
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
                  placeholder="Search drive letters, details..."
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

            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="allowed">Allowed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* USB Activity Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Usb className="h-5 w-5 text-primary" />
            <CardTitle>USB Activity Log ({filteredActivity.length})</CardTitle>
          </div>
          <CardDescription>Real-time USB insertion attempts - automatic updates every 60 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Drive Letter</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Threats Found</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(activity.detected_at)}
                      </TableCell>
                      <TableCell>{activity.hostname}</TableCell>
                      <TableCell className="font-medium max-w-xs truncate" title={activity.drive_letter}>
                        {activity.drive_letter}
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.action === 'blocked' ? 'destructive' : 'secondary'}>
                          {activity.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.threats_found}</TableCell>
                      <TableCell className="max-w-xs truncate" title={activity.details}>
                        {activity.details || 'None'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No USB Activity</h3>
              <p className="text-muted-foreground">No USB insertion attempts match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default USBActivity;