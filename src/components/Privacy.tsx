"use client";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, UserCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      
      <main className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeIn} className="mb-12">
            <div className="text-center mb-8">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  At SME CyberGuard, we take your privacy seriously. This policy explains what data we collect, why we collect it, how we use it, and your rights regarding your data.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    1. Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <h4 className="font-semibold mt-4">Account Information</h4>
                  <p className="text-muted-foreground">
                    When you sign up, we collect your business name, email address, phone number, and industry. This helps us provide and improve our service.
                  </p>

                  <h4 className="font-semibold mt-4">Device & System Data</h4>
                  <p className="text-muted-foreground">
                    Our agent collects:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>Computer hostname and operating system version</li>
                    <li>List of installed software and their versions</li>
                    <li>Running process names (not the content of what they do)</li>
                    <li>Network connection destinations (IP addresses and domains)</li>
                    <li>User login times and usernames</li>
                  </ul>

                  <h4 className="font-semibold mt-4 text-destructive">What We DON'T Collect</h4>
                  <ul className="text-muted-foreground">
                    <li>Personal documents, photos, or files</li>
                    <li>Passwords or encryption keys</li>
                    <li>Email or message content</li>
                    <li>Browsing history details</li>
                    <li>Keystrokes or screenshots</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    2. How We Use Your Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">We use collected data to:</p>
                  <ul className="text-muted-foreground">
                    <li><strong>Detect threats:</strong> Analyze patterns to identify malware, phishing, and suspicious activity</li>
                    <li><strong>Calculate risk scores:</strong> Provide your business security health dashboard</li>
                    <li><strong>Send alerts:</strong> Notify you of detected threats via SMS, WhatsApp, or email</li>
                    <li><strong>Generate reports:</strong> Create weekly/monthly security summaries</li>
                    <li><strong>Improve our service:</strong> Train our AI models to better detect threats (anonymized data only)</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    3. Data Security & Storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <h4 className="font-semibold mt-4">Where Your Data Lives</h4>
                  <p className="text-muted-foreground">
                    All data is stored in encrypted databases using Turso (libSQL). Database servers are located in secure data centers. Your data is protected by international standards unless required by law.
                  </p>

                  <h4 className="font-semibold mt-4">How We Protect It</h4>
                  <ul className="text-muted-foreground">
                    <li>End-to-end encryption in transit (TLS 1.3)</li>
                    <li>Encryption at rest (AES-256)</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Access controls and audit logs for all data access</li>
                    <li>Automatic security updates for all systems</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    4. Your Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">You have the right to:</p>
                  <ul className="text-muted-foreground">
                    <li><strong>Access your data:</strong> Request a copy of all data we have about your business</li>
                    <li><strong>Delete your data:</strong> Request deletion of your account and all associated data</li>
                    <li><strong>Correct your data:</strong> Update incorrect information in your account</li>
                    <li><strong>Export your data:</strong> Download your security reports and device inventory</li>
                    <li><strong>Opt out of marketing:</strong> Unsubscribe from promotional emails (security alerts always sent)</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    To exercise any of these rights, email us at privacy@smecyberguard.com
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    5. Data Sharing & Third Parties
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    <strong>We never sell your data.</strong> We may share limited data with:
                  </p>
                  <ul className="text-muted-foreground">
                    <li><strong>Cloud providers:</strong> Turso (database), Vercel (hosting) - covered by their privacy policies</li>
                    <li><strong>Payment processors:</strong> Stripe - only transaction data, not security data</li>
                    <li><strong>Law enforcement:</strong> Only when legally required by authorities with proper warrants</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    We do NOT share your data with advertisers, marketers, or data brokers.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>6. Data Retention</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <ul className="text-muted-foreground">
                    <li><strong>Active accounts:</strong> Data retained as long as your account is active</li>
                    <li><strong>Deleted accounts:</strong> Data deleted within 30 days of account closure</li>
                    <li><strong>Threat logs:</strong> Kept for 90 days for security analysis, then archived</li>
                    <li><strong>Billing records:</strong> Kept for 7 years as required by tax law</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>7. Cookies & Tracking</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    Our website uses minimal cookies:
                  </p>
                  <ul className="text-muted-foreground">
                    <li><strong>Essential cookies:</strong> Keep you logged in, remember your preferences</li>
                    <li><strong>Analytics cookies:</strong> Understand how you use our website (anonymous)</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    We do NOT use advertising or tracking cookies. You can disable cookies in your browser settings.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>8. Changes to This Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    We may update this policy occasionally. If we make significant changes, we'll notify you via email and in your dashboard. Continued use of SME CyberGuard after changes means you accept the updated policy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    Questions about privacy? Contact us:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>Email: privacy@smecyberguard.com</li>
                    <li>Phone: +1 555 000 000</li>
                    <li>Address: New York, NY, USA</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
