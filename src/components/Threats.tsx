"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Calendar,
  Download,
  ExternalLink
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from "@/hooks/useAuth";
import { query } from "@/lib/turso";
import { useToast } from "@/hooks/use-toast";

interface ThreatData {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'resolved' | 'ignored';
  device_id: string;
  hostname: string;
  detected_at: string;
  resolved_at: string | null;
}

interface ThreatDetails extends ThreatData {
  user?: string;
  related_events?: Array<{
    id: string;
    event_type: string;
    timestamp: string;
    description: string;
  }>;
}

interface DeviceOption {
  id: string;
  hostname: string;
}

const Threats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const businessId = user?.business_id;

  // Filter states
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedThreat, setSelectedThreat] = useState<ThreatData | null>(null);

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

  // Fetch threats with filters and 30s polling
  const { data: threats, isLoading: threatsLoading, refetch: refetchThreats } = useQuery({
    queryKey: ['threats', businessId, severityFilter, statusFilter, deviceFilter, dateRangeFilter, customStartDate, customEndDate],
    queryFn: async (): Promise<ThreatData[]> => {
      if (!businessId) throw new Error('No business ID');

      let sql = `
        SELECT
          t.id,
          t.title,
          t.description,
          t.severity,
          t.status,
          t.device_id,
          t.detected_at,
          t.resolved_at,
          d.hostname
        FROM threat_alerts t
        JOIN devices d ON t.device_id = d.id
        WHERE t.business_id = ?
      `;

      const params: any[] = [businessId];

      // Severity filter
      if (severityFilter !== "all") {
        sql += " AND t.severity = ?";
        params.push(severityFilter);
      }

      // Status filter
      if (statusFilter !== "all") {
        sql += " AND t.status = ?";
        params.push(statusFilter);
      }

      // Device filter
      if (deviceFilter !== "all") {
        sql += " AND t.device_id = ?";
        params.push(deviceFilter);
      }

      // Date range filter
      if (dateRangeFilter !== "all") {
        let startDate: string;
        const now = new Date();

        switch (dateRangeFilter) {
          case "today":
            startDate = format(now, "yyyy-MM-dd") + " 00:00:00";
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            startDate = format(weekAgo, "yyyy-MM-dd HH:mm:ss");
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            startDate = format(monthAgo, "yyyy-MM-dd HH:mm:ss");
            break;
          case "custom":
            if (customStartDate && customEndDate) {
              startDate = format(customStartDate, "yyyy-MM-dd") + " 00:00:00";
              const endDateStr = format(customEndDate, "yyyy-MM-dd") + " 23:59:59";
              sql += " AND t.detected_at BETWEEN ? AND ?";
              params.push(startDate, endDateStr);
            }
            break;
          default:
            break;
        }

        if (dateRangeFilter !== "custom" && startDate) {
          sql += " AND t.detected_at >= ?";
          params.push(startDate);
        }
      }

      sql += " ORDER BY t.detected_at DESC";

      const result = await query(sql, params);
      return result as ThreatData[];
    },
    refetchInterval: 30000, // 30 seconds
    enabled: !!businessId
  });

  // Fetch threat details for modal
  const { data: threatDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['threat-details', selectedThreat?.id],
    queryFn: async (): Promise<ThreatDetails | null> => {
      if (!selectedThreat) return null;

      const result = await query(
        'SELECT t.*, d.hostname FROM threat_alerts t JOIN devices d ON t.device_id = d.id WHERE t.id = ?',
        [selectedThreat.id]
      );
      return result[0] as ThreatDetails;
    },
    enabled: !!selectedThreat
  });

  // Mutation for updating threat status
  const updateThreatStatus = useMutation({
    mutationFn: async ({ threatId, status }: { threatId: string; status: 'resolved' | 'ignored' }) => {
      await query(
        'UPDATE threat_alerts SET status = ?, resolved_at = datetime("now") WHERE id = ?',
        [status, threatId]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      toast({
        title: "Success",
        description: "Threat status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update threat status",
        variant: "destructive",
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-KE", {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleResolve = (threatId: string) => {
    updateThreatStatus.mutate({ threatId, status: 'resolved' });
  };

  const handleIgnore = (threatId: string) => {
    updateThreatStatus.mutate({ threatId, status: 'ignored' });
  };

  const filteredThreats = threats?.filter(threat =>
    threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    threat.hostname.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (threatsLoading) {
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
          <h1 className="text-3xl md:text-4xl font-bold">Threat Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and respond to security threats across all devices</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchThreats()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="ignored">Ignored</SelectItem>
                </SelectContent>
              </Select>
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
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRangeFilter === "custom" && (
            <div className="flex gap-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threats Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Threats ({filteredThreats.length})</CardTitle>
          </div>
          <CardDescription>Real-time threat alerts with automatic updates every 30 seconds</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredThreats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreats.map((threat) => (
                    <TableRow key={threat.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(threat.detected_at)}
                      </TableCell>
                      <TableCell className="font-medium">{threat.hostname}</TableCell>
                      <TableCell className="font-medium">{threat.title}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(threat.severity) as any}>
                          {threat.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={threat.status === 'open' ? 'destructive' : 'secondary'}>
                          {threat.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedThreat(threat)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {threat.status === 'open' && (
                              <>
                                <DropdownMenuItem onClick={() => handleResolve(threat.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleIgnore(threat.id)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Mark as Ignored
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No threats found</h3>
              <p className="text-muted-foreground">No threats match your current filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat Details Modal */}
      <Dialog open={!!selectedThreat} onOpenChange={() => setSelectedThreat(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {selectedThreat?.title}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this security threat
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : threatDetails ? (
            <div className="space-y-6">
              {/* Threat Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Threat Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                    <p className="text-sm font-medium">{threatDetails.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{threatDetails.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Severity</label>
                    <Badge variant={getSeverityColor(threatDetails.severity) as any} className="mt-1">
                      {threatDetails.severity}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant={threatDetails.status === 'open' ? 'destructive' : 'secondary'} className="mt-1">
                      {threatDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Device</label>
                    <p className="text-sm mt-1">{threatDetails.hostname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Detection Time</label>
                    <p className="text-sm mt-1">{formatDate(threatDetails.detected_at)}</p>
                  </div>
                  {threatDetails.resolved_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Resolved Time</label>
                      <p className="text-sm mt-1">{formatDate(threatDetails.resolved_at)}</p>
                    </div>
                  )}
                  {threatDetails.user && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">User</label>
                      <p className="text-sm mt-1">{threatDetails.user}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Related Events */}
              {threatDetails.related_events && threatDetails.related_events.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {threatDetails.related_events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{event.event_type}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                {threatDetails.status === 'open' && (
                  <>
                    <Button onClick={() => handleResolve(threatDetails.id)} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </Button>
                    <Button variant="outline" onClick={() => handleIgnore(threatDetails.id)} className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark as Ignored
                    </Button>
                  </>
                )}
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Device
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Threats;