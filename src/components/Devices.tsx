"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Laptop,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Play,
  Shield,
  Ban,
  MoreHorizontal,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff
} from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { query } from "@/lib/turso";

interface DeviceData {
  id: string;
  hostname: string;
  os: string;
  os_version: string;
  agent_version: string;
  last_seen: string;
  status: string;
  open_threats: number;
  pending_updates: number;
}

interface DeviceDetails {
  id: string;
  hostname: string;
  os: string;
  os_version: string;
  agent_version: string;
  last_seen: string;
  status: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  installed_software: Array<{
    name: string;
    version: string;
    is_outdated: boolean;
  }>;
  security_status: string;
  active_threats: Array<{
    id: string;
    title: string;
    severity: string;
    detected_at: string;
  }>;
}

const Devices = () => {
  const { user } = useAuth();
  const businessId = user?.business_id;
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [osFilter, setOsFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(null);

  // Fetch devices with 60s polling
  const { data: devices, isLoading: devicesLoading, error: devicesError, refetch: refetchDevices } = useQuery({
    queryKey: ['devices', businessId, statusFilter, osFilter],
    queryFn: async (): Promise<DeviceData[]> => {
      if (!businessId) throw new Error('No business ID');

      try {
        let sql = `
          SELECT
            d.id,
            d.hostname,
            d.os,
            d.os_version,
            d.agent_version,
            d.last_seen,
            d.status,
            COUNT(t.id) as open_threats,
            COALESCE(p.pending_updates, 0) as pending_updates
          FROM devices d
          LEFT JOIN threat_alerts t ON d.id = t.device_id AND t.status = 'open'
          LEFT JOIN patch_status p ON d.id = p.device_id
          WHERE d.business_id = ?
        `;

        const params: any[] = [businessId];

        // Add status filter
        if (statusFilter !== "all") {
          if (statusFilter === "online") {
            sql += " AND d.last_seen > datetime('now', '-5 minutes')";
          } else if (statusFilter === "offline") {
            sql += " AND d.last_seen <= datetime('now', '-5 minutes')";
          }
        }

        // Add OS filter
        if (osFilter !== "all") {
          if (osFilter === "windows") {
            sql += " AND d.os_version LIKE '%Windows%'";
          } else if (osFilter === "linux") {
            sql += " AND d.os_version LIKE '%Linux%'";
          } else if (osFilter === "macos") {
            sql += " AND d.os_version LIKE '%macOS%'";
          }
        }

        sql += " GROUP BY d.id ORDER BY d.last_seen DESC";

        const result = await query(sql, params);
        return result as DeviceData[];
      } catch (error) {
        console.error('Error fetching devices:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch device details for modal
  const { data: deviceDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['device-details', selectedDevice?.id],
    queryFn: async (): Promise<DeviceDetails | null> => {
      if (!selectedDevice) return null;

      try {
        // Get device basic info
        const deviceResult = await query(
          'SELECT id, hostname, os, os_version, agent_version, last_seen, status FROM devices WHERE id = ?',
          [selectedDevice.id]
        );

        if (deviceResult.length === 0) return null;

        const device = deviceResult[0];

        // Get installed software
        const softwareResult = await query(
          'SELECT name, version, is_outdated FROM software_inventory WHERE device_id = ? AND business_id = ?',
          [selectedDevice.id, businessId]
        );

        // Get active threats
        const threatsResult = await query(
          'SELECT id, title, severity, detected_at FROM threat_alerts WHERE device_id = ? AND business_id = ? AND status = "open" ORDER BY detected_at DESC',
          [selectedDevice.id, businessId]
        );

        return {
          ...device,
          installed_software: softwareResult,
          active_threats: threatsResult,
          cpu_usage: Math.floor(Math.random() * 100), // Mock data
          memory_usage: Math.floor(Math.random() * 100), // Mock data
          disk_usage: Math.floor(Math.random() * 100), // Mock data
          security_status: selectedDevice.open_threats > 0 ? 'at_risk' : 'secure'
        } as DeviceDetails;
      } catch (error) {
        console.error('Error fetching device details:', error);
        throw error;
      }
    },
    enabled: !!selectedDevice
  });

  const getDeviceStatus = (lastSeen: string) => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

    if (diffMinutes < 5) return { status: "online", variant: "default" as const, icon: Wifi };
    if (diffMinutes < 60) return { status: "warning", variant: "secondary" as const, icon: WifiOff };
    return { status: "offline", variant: "outline" as const, icon: WifiOff };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-KE", {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRemoteAction = async (action: string, deviceId: string) => {
    try {
      // Insert remote command into database
      await query(
        'INSERT INTO remote_commands (id, business_id, device_id, command, target, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), businessId, deviceId, action, deviceId, 'pending', user?.id]
      );

      // Show success message (you could add toast here)
      alert(`${action} command sent to device`);
    } catch (error) {
      console.error('Error sending remote command:', error);
      alert('Failed to send command to device');
    }
  };

  const filteredDevices = devices?.filter(device =>
    device.hostname.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (devicesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (devicesError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading devices</h3>
          <p className="text-muted-foreground">Please try refreshing the page</p>
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
          <h1 className="text-3xl md:text-4xl font-bold">Device Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all your protected devices</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchDevices()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
            <Select value={osFilter} onValueChange={setOsFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by OS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All OS</SelectItem>
                <SelectItem value="windows">Windows</SelectItem>
                <SelectItem value="linux">Linux</SelectItem>
                <SelectItem value="macos">macOS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <CardTitle>Devices ({filteredDevices.length})</CardTitle>
          </div>
          <CardDescription>Real-time status of all connected devices</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDevices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hostname</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Active Threats</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.map((device) => {
                    const deviceStatus = getDeviceStatus(device.last_seen);
                    const StatusIcon = deviceStatus.icon;
                    return (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.hostname}</TableCell>
                        <TableCell>
                          <Badge variant={deviceStatus.variant} className="flex items-center gap-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            {deviceStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{device.os_version}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(device.last_seen)}
                        </TableCell>
                        <TableCell>
                          {device.open_threats > 0 ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {device.open_threats}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">0</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedDevice(device)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRemoteAction('scan_now', device.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Scan Now
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRemoteAction('update_patches', device.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Update Patches
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRemoteAction('isolate_device', device.id)}>
                                <Ban className="h-4 w-4 mr-2" />
                                Isolate Device
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No devices found</h3>
              <p className="text-muted-foreground">No devices match your current filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Details Modal */}
      <Dialog open={!!selectedDevice} onOpenChange={() => setSelectedDevice(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {selectedDevice?.hostname} - Device Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about this device
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : deviceDetails ? (
            <div className="space-y-6">
              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hostname</label>
                    <p className="text-sm">{deviceDetails.hostname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">OS</label>
                    <p className="text-sm">{deviceDetails.os}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">OS Version</label>
                    <p className="text-sm">{deviceDetails.os_version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Agent Version</label>
                    <p className="text-sm">{deviceDetails.agent_version}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Seen</label>
                    <p className="text-sm">{formatDate(deviceDetails.last_seen)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Security Status</label>
                    <Badge variant={deviceDetails.security_status === 'secure' ? 'default' : 'destructive'}>
                      {deviceDetails.security_status === 'secure' ? 'Secure' : 'At Risk'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">{deviceDetails.cpu_usage}%</div>
                    <p className="text-sm text-muted-foreground">CPU Usage</p>
                  </div>
                  <div className="text-center">
                    <HardDrive className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">{deviceDetails.memory_usage}%</div>
                    <p className="text-sm text-muted-foreground">Memory Usage</p>
                  </div>
                  <div className="text-center">
                    <HardDrive className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-2xl font-bold">{deviceDetails.disk_usage}%</div>
                    <p className="text-sm text-muted-foreground">Disk Usage</p>
                  </div>
                </CardContent>
              </Card>

              {/* Active Threats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Threats ({deviceDetails.active_threats.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {deviceDetails.active_threats.length > 0 ? (
                    <div className="space-y-2">
                      {deviceDetails.active_threats.map((threat) => (
                        <div key={threat.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{threat.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Detected: {formatDate(threat.detected_at)}
                            </p>
                          </div>
                          <Badge variant={threat.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {threat.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No active threats</p>
                  )}
                </CardContent>
              </Card>

              {/* Installed Software */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Installed Software ({deviceDetails.installed_software.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {deviceDetails.installed_software.map((software, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{software.name}</p>
                          <p className="text-sm text-muted-foreground">v{software.version}</p>
                        </div>
                        {software.is_outdated && (
                          <Badge variant="outline">Outdated</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Devices;