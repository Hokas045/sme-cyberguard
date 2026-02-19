"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Shield,
  AlertTriangle,
  Monitor,
  Package,
  Clock,
  Eye,
  Play,
  MoreHorizontal,
  CheckCircle,
  XCircle
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

interface PatchOverview {
  totalDevices: number;
  devicesNeedingUpdates: number;
  criticalUpdatesPending: number;
  lastUpdateCheck: string | null;
}

interface DeviceNeedingUpdates {
  id: string;
  hostname: string;
  os_version: string;
  pending_updates: number;
  critical_updates: number;
  last_checked: string;
}

interface OutdatedSoftware {
  name: string;
  version: string;
  latest_version: string;
  affected_devices: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface DeviceDetails {
  id: string;
  hostname: string;
  os_version: string;
  agent_version: string;
  last_seen: string;
  ip_address: string;
  pending_updates: number;
  critical_updates: number;
  last_checked: string;
}

const Patches = () => {
  const { user } = useAuth();
  const businessId = user?.business_id;
  const [selectedDevice, setSelectedDevice] = useState<DeviceNeedingUpdates | null>(null);

  // Fetch patch overview with 60s polling
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['patch-overview', businessId],
    queryFn: async (): Promise<PatchOverview> => {
      if (!businessId) throw new Error('No business ID');

      // Get total devices
      const totalDevicesResult = await query(
        'SELECT COUNT(*) as count FROM devices WHERE business_id = ?',
        [businessId]
      );

      // Get devices needing updates
      const devicesNeedingUpdatesResult = await query(
        'SELECT COUNT(*) as count FROM patch_status WHERE business_id = ? AND pending_updates > 0',
        [businessId]
      );

      // Get critical updates pending
      const criticalUpdatesResult = await query(
        'SELECT COALESCE(SUM(critical_updates), 0) as count FROM patch_status WHERE business_id = ?',
        [businessId]
      );

      // Get last update check
      const lastUpdateCheckResult = await query(
        'SELECT MAX(last_checked) as last_check FROM patch_status WHERE business_id = ?',
        [businessId]
      );

      return {
        totalDevices: totalDevicesResult[0]?.count || 0,
        devicesNeedingUpdates: devicesNeedingUpdatesResult[0]?.count || 0,
        criticalUpdatesPending: criticalUpdatesResult[0]?.count || 0,
        lastUpdateCheck: lastUpdateCheckResult[0]?.last_check || null
      };
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch devices needing updates with 60s polling
  const { data: devicesNeedingUpdates, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['devices-needing-updates', businessId],
    queryFn: async (): Promise<DeviceNeedingUpdates[]> => {
      if (!businessId) throw new Error('No business ID');

      const result = await query(`
        SELECT
          d.id,
          d.hostname,
          d.os_version,
          COALESCE(p.pending_updates, 0) as pending_updates,
          COALESCE(p.critical_updates, 0) as critical_updates,
          p.last_checked
        FROM devices d
        LEFT JOIN patch_status p ON d.id = p.device_id
        WHERE d.business_id = ? AND COALESCE(p.pending_updates, 0) > 0
        ORDER BY p.pending_updates DESC
      `, [businessId]);

      return result as DeviceNeedingUpdates[];
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch outdated software with 60s polling
  const { data: outdatedSoftware, isLoading: softwareLoading, refetch: refetchSoftware } = useQuery({
    queryKey: ['outdated-software', businessId],
    queryFn: async (): Promise<OutdatedSoftware[]> => {
      if (!businessId) throw new Error('No business ID');

      const result = await query(`
        SELECT
          s.name,
          s.version,
          s.latest_version,
          COUNT(DISTINCT s.device_id) as affected_devices,
          s.severity
        FROM software_inventory s
        WHERE s.business_id = ? AND s.is_outdated = 1
        GROUP BY s.name, s.version, s.latest_version, s.severity
        ORDER BY affected_devices DESC
      `, [businessId]);

      return result as OutdatedSoftware[];
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch device details for modal
  const { data: deviceDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['device-patch-details', selectedDevice?.id],
    queryFn: async (): Promise<DeviceDetails | null> => {
      if (!selectedDevice) return null;

      const result = await query(`
        SELECT
          d.*,
          COALESCE(p.pending_updates, 0) as pending_updates,
          COALESCE(p.critical_updates, 0) as critical_updates,
          p.last_checked
        FROM devices d
        LEFT JOIN patch_status p ON d.id = p.device_id
        WHERE d.id = ?
      `, [selectedDevice.id]);

      return result[0] as DeviceDetails;
    },
    enabled: !!selectedDevice
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString("en-KE", {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleTriggerUpdate = async (deviceId: string) => {
    try {
      // Insert remote command to trigger updates
      await query(
        'INSERT INTO remote_commands (id, business_id, device_id, command, target, status) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), businessId, deviceId, 'update_patches', 'patches', 'pending']
      );

      // Show success message
      alert('Update command sent to device');
    } catch (error) {
      console.error('Failed to trigger update:', error);
      alert('Failed to send update command. Please try again.');
    }
  };

  const handleViewDeviceDetails = (device: DeviceNeedingUpdates) => {
    setSelectedDevice(device);
  };

  if (overviewLoading || devicesLoading || softwareLoading) {
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
          <h1 className="text-3xl md:text-4xl font-bold">Updates & Patches</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage software updates across all devices</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          refetchOverview();
          refetchDevices();
          refetchSoftware();
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalDevices || 0}</div>
            <p className="text-xs text-muted-foreground">Active devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devices Needing Updates</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.devicesNeedingUpdates || 0}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Updates Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.criticalUpdatesPending || 0}</div>
            <p className="text-xs text-muted-foreground">Security critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update Check</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{formatDate(overview?.lastUpdateCheck || '')}</div>
            <p className="text-xs text-muted-foreground">Latest scan</p>
          </CardContent>
        </Card>
      </div>

      {/* Devices Needing Updates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Devices Needing Updates ({devicesNeedingUpdates?.length || 0})</CardTitle>
          </div>
          <CardDescription>Devices with pending software updates</CardDescription>
        </CardHeader>
        <CardContent>
          {devicesNeedingUpdates && devicesNeedingUpdates.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Pending Updates</TableHead>
                    <TableHead>Critical Updates</TableHead>
                    <TableHead>Last Check Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devicesNeedingUpdates.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.hostname}</TableCell>
                      <TableCell>{device.os_version}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{device.pending_updates}</Badge>
                      </TableCell>
                      <TableCell>
                        {device.critical_updates > 0 ? (
                          <Badge variant="destructive">{device.critical_updates}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(device.last_checked)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDeviceDetails(device)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTriggerUpdate(device.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Trigger Updates
                            </DropdownMenuItem>
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
              <h3 className="text-lg font-semibold mb-2">All devices up to date</h3>
              <p className="text-muted-foreground">No devices require updates at this time</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outdated Software Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle>Outdated Software ({outdatedSoftware?.length || 0})</CardTitle>
          </div>
          <CardDescription>Software that needs updating across your devices</CardDescription>
        </CardHeader>
        <CardContent>
          {outdatedSoftware && outdatedSoftware.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software Name</TableHead>
                    <TableHead>Current Version</TableHead>
                    <TableHead>Latest Version</TableHead>
                    <TableHead>Affected Devices</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outdatedSoftware.map((software, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{software.name}</TableCell>
                      <TableCell>{software.version}</TableCell>
                      <TableCell>{software.latest_version}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{software.affected_devices}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(software.severity) as any}>
                          {software.severity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All software up to date</h3>
              <p className="text-muted-foreground">No outdated software detected</p>
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
              {selectedDevice?.hostname} - Patch Details
            </DialogTitle>
            <DialogDescription>
              Update status and patch information for this device
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : deviceDetails ? (
            <div className="space-y-6">
              {/* Device Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Information</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hostname</label>
                    <p className="text-sm">{deviceDetails.hostname}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                    <p className="text-sm">{deviceDetails.ip_address}</p>
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
                    <label className="text-sm font-medium text-muted-foreground">Last Update Check</label>
                    <p className="text-sm">{formatDate(deviceDetails.last_checked)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Update Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Update Status</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Pending Updates</label>
                    <div className="text-2xl font-bold">{deviceDetails.pending_updates}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Critical Updates</label>
                    <div className="text-2xl font-bold text-red-600">{deviceDetails.critical_updates}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleTriggerUpdate(deviceDetails.id)} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Trigger Updates
                </Button>
                <Button variant="outline" onClick={() => setSelectedDevice(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Patches;