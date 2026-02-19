"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
  Settings,
  Crown,
  Zap
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useCurrency } from '@/hooks/useCurrency';
import TrialConversion from '@/components/TrialConversion';
import DashboardLayout from '@/components/DashboardLayout';

const Billing = () => {
  const { subscription, loading, cancelSubscription, getPaymentHistory } = useSubscription();
  const { code: currencyCode, convertFromUSD } = useCurrency();
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadPaymentHistory = async () => {
      try {
        const history = await getPaymentHistory();
        setPaymentHistory(history);
      } catch (error) {
        console.error('Failed to load payment history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadPaymentHistory();
  }, [getPaymentHistory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'trialing': return 'text-blue-600';
      case 'past_due': return 'text-orange-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing': return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'past_due': return <Badge className="bg-orange-100 text-orange-800">Past Due</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
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
        {/* Trial Conversion Component */}
        {subscription?.trialStatus?.isOnTrial && (
          <TrialConversion />
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and payment methods
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="settings">Billing Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Subscription Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subscription ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{subscription.planName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(subscription.status)}
                          {subscription.trialStatus?.isOnTrial && (
                            <Badge variant="outline">
                              {subscription.trialStatus.daysRemaining} days left
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Amount</span>
                          <span className="font-medium">
                            {currencyCode} {subscription.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Billing Cycle</span>
                          <span className="font-medium capitalize">{subscription.status === 'trialing' ? 'Trial' : 'Monthly'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Next Billing</span>
                          <span className="font-medium">
                            {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {subscription.trialStatus?.isOnTrial && (
                        <div>
                          <h4 className="font-medium mb-2">Trial Progress</h4>
                          <Progress
                            value={(14 - (subscription.trialStatus.daysRemaining || 0)) / 14 * 100}
                            className="h-2"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            {subscription.trialStatus.daysRemaining} days remaining
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                          <Button
                            variant="outline"
                            onClick={() => cancelSubscription(false)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel Subscription
                          </Button>
                        )}
                        {subscription.cancelAtPeriodEnd && (
                          <Badge variant="outline" className="text-orange-600">
                            Cancels {formatDate(subscription.currentPeriodEnd)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have an active subscription. Start your free trial to get started.
                    </p>
                    <Button>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Free Trial
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Successful Payments</p>
                      <p className="text-2xl font-bold">
                        {paymentHistory.filter(p => p.status === 'success').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-2xl font-bold">
                        {currencyCode} {paymentHistory
                          .filter(p => p.status === 'success')
                          .reduce((sum, p) => sum + Number(p.amount_usd), 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Payment</p>
                      <p className="text-2xl font-bold">
                        {subscription?.nextBillingDate ? formatDate(subscription.nextBillingDate) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  View all your payment transactions and invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : paymentHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.created_at)}</TableCell>
                          <TableCell>
                            {payment.billing_cycle === 'yearly' ? 'Annual Subscription' : 'Monthly Subscription'}
                          </TableCell>
                          <TableCell>
                            {currencyCode} {Number(payment.amount_usd).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentStatusIcon(payment.status)}
                              <span className="capitalize">{payment.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Payment History</h3>
                    <p className="text-muted-foreground">
                      Your payment history will appear here once you make payments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Billing Settings
                </CardTitle>
                <CardDescription>
                  Manage your billing preferences and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Payment Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Paystack</p>
                          <p className="text-sm text-muted-foreground">
                            Secure payments powered by Paystack
                          </p>
                        </div>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Billing Information</h4>
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Billing Email</label>
                        <p className="text-sm text-muted-foreground">user@example.com</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Currency</label>
                        <p className="text-sm text-muted-foreground">{currencyCode}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {subscription?.status === 'active' && (
                  <div className="pt-6 border-t">
                    <h4 className="font-medium mb-4 text-red-600">Danger Zone</h4>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Cancelling your subscription will disable all security features.
                        You can reactivate at any time.
                      </AlertDescription>
                    </Alert>
                    <Button
                      variant="destructive"
                      className="mt-4"
                      onClick={() => cancelSubscription(true)}
                    >
                      Cancel Subscription Immediately
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Billing;