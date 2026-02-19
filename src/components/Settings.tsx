"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Shield,
  Building,
  Key,
  Ban,
  Bell,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { query } from "@/lib/turso";
import { useToast } from "@/hooks/use-toast";

interface BusinessData {
  id: string;
  name: string;
  industry: string;
  risk_score: number;
  status: string;
}

interface ActivationToken {
  token: string;
  expires_at: string;
  used_at?: string;
  used_by_device?: string;
}

interface BlockedDomain {
  domain: string;
  reason?: string;
  block_type: string;
  added_at: string;
  added_by: string;
}

const Settings = () => {
  const { user, checkRole } = useAuth();
  const { toast } = useToast();
  const businessId = user?.business_id;
  const isOwner = checkRole('owner');
  const isAdmin = checkRole('admin');

  // Business Profile Query
  const { data: business, isLoading: businessLoading, refetch: refetchBusiness } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async (): Promise<BusinessData> => {
      if (!businessId) throw new Error('No business ID');
      const result = await query('SELECT id, name, industry, risk_score, status FROM businesses WHERE id = ?', [businessId]);
      return result[0] as BusinessData;
    },
    enabled: !!businessId,
    refetchInterval: 30000
  });

  // Activation Tokens Query
  const { data: tokens, isLoading: tokensLoading, refetch: refetchTokens } = useQuery({
    queryKey: ['activation-tokens', businessId],
    queryFn: async (): Promise<ActivationToken[]> => {
      if (!businessId) throw new Error('No business ID');
      return await query('SELECT token, expires_at, used_at, used_by_device FROM agent_activation_tokens WHERE business_id = ? ORDER BY created_at DESC', [businessId]);
    },
    enabled: !!businessId,
    refetchInterval: 30000
  });

  // Blocked Domains Query
  const { data: blockedDomains, isLoading: domainsLoading, refetch: refetchDomains } = useQuery({
    queryKey: ['blocked-domains', businessId],
    queryFn: async (): Promise<BlockedDomain[]> => {
      if (!businessId) throw new Error('No business ID');
      return await query('SELECT domain, reason, block_type, added_at, added_by FROM business_blocked_domains WHERE business_id = ? ORDER BY added_at DESC', [businessId]);
    },
    enabled: !!businessId,
    refetchInterval: 30000
  });

  // Mutations
  const updateBusinessMutation = useMutation({
    mutationFn: async (data: Partial<BusinessData>) => {
      await query('UPDATE businesses SET name = ?, industry = ? WHERE id = ?', [
        data.name, data.industry, businessId
      ]);
    },
    onSuccess: () => {
      refetchBusiness();
      toast({ title: "Success", description: "Business profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update business profile", variant: "destructive" });
    }
  });

  const generateTokenMutation = useMutation({
    mutationFn: async () => {
      const token = 'CG-' + Math.random().toString(36).substring(2, 15).toUpperCase();
      await query('INSERT INTO agent_activation_tokens (token, business_id, expires_at) VALUES (?, ?, datetime("now", "+30 days"))', [token, businessId]);
      return token;
    },
    onSuccess: (token) => {
      refetchTokens();
      toast({ title: "Success", description: `New activation token generated: ${token}` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate token", variant: "destructive" });
    }
  });

  const revokeTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      await query('DELETE FROM agent_activation_tokens WHERE token = ? AND business_id = ?', [token, businessId]);
    },
    onSuccess: () => {
      refetchTokens();
      toast({ title: "Success", description: "Token revoked successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to revoke token", variant: "destructive" });
    }
  });

  const addDomainMutation = useMutation({
    mutationFn: async (data: { domain: string; reason: string }) => {
      await query('INSERT INTO business_blocked_domains (id, business_id, domain, reason, added_by) VALUES (?, ?, ?, ?, ?)', [
        crypto.randomUUID(), businessId, data.domain, data.reason, user?.email
      ]);
    },
    onSuccess: () => {
      refetchDomains();
      toast({ title: "Success", description: "Domain blocked successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to block domain", variant: "destructive" });
    }
  });

  const removeDomainMutation = useMutation({
    mutationFn: async (domain: string) => {
      await query('DELETE FROM business_blocked_domains WHERE domain = ? AND business_id = ?', [domain, businessId]);
    },
    onSuccess: () => {
      refetchDomains();
      toast({ title: "Success", description: "Domain unblocked successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to unblock domain", variant: "destructive" });
    }
  });

  // Form states
  const [businessForm, setBusinessForm] = useState({
    name: '',
    industry: ''
  });

  const [newDomain, setNewDomain] = useState({ domain: '', reason: '' });

  // Notification settings (placeholder)
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    severityThreshold: 'high',
    dailySummary: true,
    weeklyReport: false
  });

  // Set business form when data loads
  useEffect(() => {
    if (business) {
      setBusinessForm({
        name: business.name || '',
        industry: business.industry || ''
      });
    }
  }, [business]);

  // Handlers
  const handleUpdateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner && !isAdmin) return;
    updateBusinessMutation.mutate(businessForm);
  };

  const handleGenerateToken = () => {
    if (!isOwner) return;
    generateTokenMutation.mutate();
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({ title: "Copied", description: "Token copied to clipboard" });
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.domain.trim()) return;
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain.domain)) {
      toast({ title: "Invalid Domain", description: "Please enter a valid domain name", variant: "destructive" });
      return;
    }
    addDomainMutation.mutate(newDomain);
    setNewDomain({ domain: '', reason: '' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-KE", {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTokenStatus = (token: ActivationToken) => {
    if (token.used_at) return { status: 'used', color: 'default' };
    if (new Date(token.expires_at) < new Date()) return { status: 'expired', color: 'destructive' };
    return { status: 'active', color: 'default' };
  };

  if (!user) {
    return <div>Access denied</div>;
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
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your business settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            refetchBusiness();
            refetchTokens();
            refetchDomains();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Role Warning */}
      {!isOwner && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">You have limited access to settings. Some features are restricted to owners only.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Business Profile
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Activation Tokens
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Blocked Domains
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Profile
              </CardTitle>
              <CardDescription>
                Update your business information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {businessLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleUpdateBusiness} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-name">Business Name *</Label>
                      <Input
                        id="business-name"
                        value={businessForm.name}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        disabled={!isOwner && !isAdmin}
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={businessForm.industry}
                        onValueChange={(value) => setBusinessForm(prev => ({ ...prev, industry: value }))}
                        disabled={!isOwner && !isAdmin}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="hospitality">Hospitality</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(isOwner || isAdmin) && (
                    <div className="flex justify-end">
                      <Button type="submit" disabled={updateBusinessMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateBusinessMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activation Tokens Tab */}
        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Activation Tokens
                  </CardTitle>
                  <CardDescription>
                    Manage activation tokens for new devices
                  </CardDescription>
                </div>
                {isOwner && (
                  <Button onClick={handleGenerateToken} disabled={generateTokenMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Token
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {tokensLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : tokens && tokens.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Used By</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokens.map((token) => {
                        const { status, color } = getTokenStatus(token);
                        return (
                          <TableRow key={token.token}>
                            <TableCell className="font-mono text-sm">{token.token}</TableCell>
                            <TableCell>
                              <Badge variant={color as any}>
                                {status === 'used' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {status === 'expired' && <XCircle className="h-3 w-3 mr-1" />}
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(token.expires_at)}</TableCell>
                            <TableCell>{token.used_by_device || '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyToken(token.token)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                {isOwner && status === 'active' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Revoke Token</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to revoke this activation token? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => revokeTokenMutation.mutate(token.token)}>
                                          Revoke
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No activation tokens</h3>
                  <p className="text-muted-foreground">Generate your first token to start adding devices</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Domains Tab */}
        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5" />
                    Blocked Domains
                  </CardTitle>
                  <CardDescription>
                    Manage custom blocked domains for web protection
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Domain Form */}
              {(isOwner || isAdmin) && (
                <form onSubmit={handleAddDomain} className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="example.com"
                      value={newDomain.domain}
                      onChange={(e) => setNewDomain(prev => ({ ...prev, domain: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Reason (optional)"
                      value={newDomain.reason}
                      onChange={(e) => setNewDomain(prev => ({ ...prev, reason: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" disabled={addDomainMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </form>
              )}

              {/* Domains List */}
              {domainsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : blockedDomains && blockedDomains.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Domain</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Block Type</TableHead>
                        <TableHead>Added By</TableHead>
                        <TableHead>Added At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedDomains.map((domain) => (
                        <TableRow key={domain.domain}>
                          <TableCell className="font-medium">{domain.domain}</TableCell>
                          <TableCell>{domain.reason || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={domain.block_type === 'block' ? 'destructive' : 'default'}>
                              {domain.block_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{domain.added_by}</TableCell>
                          <TableCell>{formatDate(domain.added_at)}</TableCell>
                          <TableCell>
                            {(isOwner || isAdmin) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Blocked Domain</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to unblock this domain? Devices will no longer block access to it.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeDomainMutation.mutate(domain.domain)}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No blocked domains</h3>
                  <p className="text-muted-foreground">Add domains to block across all your devices</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure email notifications and alert preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for security threats</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailEnabled}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailEnabled: checked }))}
                    disabled={!isOwner && !isAdmin}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Severity Threshold</Label>
                  <Select
                    value={notifications.severityThreshold}
                    onValueChange={(value) => setNotifications(prev => ({ ...prev, severityThreshold: value }))}
                    disabled={!isOwner && !isAdmin}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">All alerts (Low, Medium, High, Critical)</SelectItem>
                      <SelectItem value="medium">Medium and above</SelectItem>
                      <SelectItem value="high">High and Critical only</SelectItem>
                      <SelectItem value="critical">Critical only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="daily-summary">Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">Receive daily security summary emails</p>
                  </div>
                  <Switch
                    id="daily-summary"
                    checked={notifications.dailySummary}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailySummary: checked }))}
                    disabled={!isOwner && !isAdmin}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-report">Weekly Report</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly security reports</p>
                  </div>
                  <Switch
                    id="weekly-report"
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
                    disabled={!isOwner && !isAdmin}
                  />
                </div>
              </div>

              {(isOwner || isAdmin) && (
                <div className="flex justify-end">
                  <Button>Save Notification Settings</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing & Subscription
              </CardTitle>
              <CardDescription>
                Manage your subscription and payment information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Billing and subscription management features will be available in a future update.
                  For now, your account is on a free trial plan.
                </p>
                <div className="mt-6 space-y-2">
                  <p className="text-sm"><strong>Current Plan:</strong> Free Trial</p>
                  <p className="text-sm"><strong>Devices:</strong> {tokens?.length || 0} / Unlimited</p>
                  <p className="text-sm"><strong>Status:</strong> <Badge variant="default">Active</Badge></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Settings;