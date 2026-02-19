"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Laptop,
  RefreshCw,
  TrendingUp,
  Activity,
  Clock,
  Key,
  Copy,
  Plus,
  Ban
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { query } from "@/lib/turso";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MetricData {
  active_devices: number;
  threats_today: number;
  risk_score: number;
  pending_updates: number;
}

interface ThreatData {
  hostname: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: string;
  detected_at: string;
}

interface DeviceData {
  id: string;
  hostname: string;
  last_seen: string;
  threat_count: number;
}

interface RiskHistoryData {
  score: number;
  recorded_at: string;
}

interface ActivationCodeData {
  id: string;
  code: string;
  status: string;
  created_at: string;
  expires_at: string;
  used_count: number;
  max_uses: number;
  last_used_at: string | null;
  effective_status: string;
  revoked_reason: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const businessId = user?.business_id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [codeToRevoke, setCodeToRevoke] = useState<string | null>(null);

  // Fetch metrics with 60s polling
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useQuery({
    queryKey: ['dashboard-metrics', businessId],
    queryFn: async (): Promise<MetricData> => {
      if (!businessId) throw new Error('No business ID');

      const result = await query(`
        SELECT
          (SELECT COUNT(*) FROM devices WHERE business_id = ?) as active_devices,
          (SELECT COUNT(*) FROM threat_alerts WHERE business_id = ? AND detected_at > datetime('now', '-24 hours')) as threats_today,
          (SELECT COALESCE(risk_score, 50) FROM businesses WHERE id = ?) as risk_score,
          (SELECT COALESCE(SUM(pending_updates), 0) FROM patch_status WHERE business_id = ?) as pending_updates
      `, [businessId, businessId, businessId, businessId]);

      return result[0] as unknown as MetricData;
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch recent threats with 30s polling
  const { data: threats, isLoading: threatsLoading, error: threatsError } = useQuery({
    queryKey: ['recent-threats', businessId],
    queryFn: async (): Promise<ThreatData[]> => {
      if (!businessId) return [];

      const result = await query(`
        SELECT
          d.hostname,
          t.title,
          t.severity,
          t.status,
          t.detected_at
        FROM threat_alerts t
        JOIN devices d ON t.device_id = d.id
        WHERE t.business_id = ?
        ORDER BY t.detected_at DESC
        LIMIT 10
      `, [businessId]);

      return result as unknown as ThreatData[];
    },
    refetchInterval: 30000, // 30 seconds
    enabled: !!businessId
  });

  // Fetch device status with 60s polling
  const { data: devices, isLoading: devicesLoading, error: devicesError } = useQuery({
    queryKey: ['device-status', businessId],
    queryFn: async (): Promise<DeviceData[]> => {
      if (!businessId) return [];

      const result = await query(`
        SELECT
          d.id,
          d.hostname,
          d.last_seen,
          COUNT(t.id) as threat_count
        FROM devices d
        LEFT JOIN threat_alerts t ON d.id = t.device_id AND t.status = 'open'
        WHERE d.business_id = ?
        GROUP BY d.id
        ORDER BY d.last_seen DESC
      `, [businessId]);

      return result as unknown as DeviceData[];
    },
    refetchInterval: 60000, // 60 seconds
    enabled: !!businessId
  });

  // Fetch risk history for chart
  const { data: riskHistory, isLoading: riskHistoryLoading, error: riskHistoryError } = useQuery({
    queryKey: ['risk-history', businessId],
    queryFn: async (): Promise<RiskHistoryData[]> => {
      if (!businessId) return [];

      const result = await query(`
        SELECT score, recorded_at
        FROM risk_score_history
        WHERE business_id = ?
        ORDER BY recorded_at DESC
        LIMIT 30
      `, [businessId]);

      return result.reverse() as unknown as RiskHistoryData[]; // Reverse to show chronological order
    },
    refetchInterval: 60000,
    enabled: !!businessId
  });

  // Fetch activation codes
  const { data: activationCodes, isLoading: codesLoading } = useQuery({
    queryKey: ['activation-codes', businessId],
    queryFn: async (): Promise<ActivationCodeData[]> => {
      if (!businessId) return [];

      const response = await fetch(`/api/activation-codes?businessId=${businessId}`);
      const data = await response.json();
      return data.codes || [];
    },
    refetchInterval: 60000,
    enabled: !!businessId
  });

  // Generate new activation code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/activation-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          userId: user?.id,
          expiresInDays: 365,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate code');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-codes', businessId] });
      toast({
        title: "Activation Code Generated",
        description: "A new activation code has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate activation code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Revoke activation code mutation
  const revokeCodeMutation = useMutation({
    mutationFn: async (codeId: string) => {
      const response = await fetch(
        `/api/activation-codes?codeId=${codeId}&userId=${user?.id}&reason=Revoked by user`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to revoke code');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activation-codes', businessId] });
      setRevokeDialogOpen(false);
      setCodeToRevoke(null);
      toast({
        title: "Code Revoked",
        description: "The activation code has been revoked and can no longer be used.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke activation code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Activation code copied to clipboard.",
    });
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getDeviceStatus = (lastSeen: string) => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);

    if (diffMinutes < 5) return { status: "online", variant: "default" as const };
    if (diffMinutes < 60) return { status: "warning", variant: "secondary" as const };
    return { status: "offline", variant: "outline" as const };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-KE", {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatChartDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      month: 'short',
      day: 'numeric'
    });
  };

  if (metricsLoading || threatsLoading || devicesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (metricsError || threatsError || devicesError || riskHistoryError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-destructive">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
          <p>Unable to load dashboard data. Please try refreshing the page.</p>
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
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time security monitoring for your business</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Laptop className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.active_devices || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Protected devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.threats_today || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In the last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.risk_score || 0}/100</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(metrics?.risk_score || 0) <= 30 ? "Low" : (metrics?.risk_score || 0) <= 70 ? "Medium" : "High"} risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Updates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.pending_updates || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {(metrics?.pending_updates || 0) > 0 ? `${Math.min(metrics?.pending_updates || 0, 3)} critical` : "All up to date"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Score Trend</CardTitle>
          <CardDescription>30-day risk score history</CardDescription>
        </CardHeader>
        <CardContent>
          {riskHistory && riskHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="recorded_at"
                  tickFormatter={formatChartDate}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} fontSize={12} />
                <Tooltip
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: number) => [`${value}/100`, 'Risk Score']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0066CC"
                  strokeWidth={2}
                  dot={{ fill: '#0066CC', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No risk history data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Threats Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Recent Threats</CardTitle>
          </div>
          <CardDescription>Latest security alerts and threats detected</CardDescription>
        </CardHeader>
        <CardContent>
          {threats && threats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Threat</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {threats.map((threat, index) => (
                    <TableRow key={`${threat.hostname}-${threat.detected_at}-${index}`}>
                      <TableCell className="font-medium">{threat.hostname}</TableCell>
                      <TableCell>{threat.title}</TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(threat.severity)}>
                          {threat.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={threat.status === 'open' ? 'destructive' : 'secondary'}>
                          {threat.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(threat.detected_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Recent Threats</h3>
              <p className="text-muted-foreground">Your devices are secure and threat-free</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Status Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Device Status</CardTitle>
          </div>
          <CardDescription>Current status of all protected devices</CardDescription>
        </CardHeader>
        <CardContent>
          {devices && devices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {devices.map((device) => {
                const deviceStatus = getDeviceStatus(device.last_seen);
                return (
                  <Card key={device.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium truncate">{device.hostname}</h4>
                        <Badge variant={deviceStatus.variant}>
                          {deviceStatus.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Last seen: {formatDate(device.last_seen)}</p>
                        <p>Active threats: {device.threat_count}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Laptop className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No devices connected yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Install the agent on your Windows computers to start monitoring
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Dashboard;
