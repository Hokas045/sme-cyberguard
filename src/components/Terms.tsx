"use client";
import { motion } from "framer-motion";
import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";

const Terms = () => {
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
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
              <p className="text-muted-foreground">Last updated: January 2025</p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  These Terms of Service ("Terms") govern your use of SME CyberGuard's security platform. By creating an account or using our service, you agree to these Terms. Please read them carefully.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    1. Service Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    SME CyberGuard provides cybersecurity monitoring and threat detection services for small and medium businesses worldwide. Our service includes:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>Windows agent software for endpoint monitoring</li>
                    <li>AI-powered threat detection and analysis</li>
                    <li>Real-time security dashboard and alerts</li>
                    <li>Phishing simulation and employee training (Business+ plans)</li>
                    <li>Customer support as specified in your plan</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>2. Account Registration</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <h4 className="font-semibold mt-4">Eligibility</h4>
                  <p className="text-muted-foreground">
                    You must be at least 18 years old and have the legal authority to enter into binding contracts on behalf of your business.
                  </p>

                  <h4 className="font-semibold mt-4">Account Security</h4>
                  <ul className="text-muted-foreground">
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must notify us immediately of any unauthorized access</li>
                    <li>You are responsible for all activities under your account</li>
                    <li>You may not share your account with others</li>
                  </ul>

                  <h4 className="font-semibold mt-4">Accurate Information</h4>
                  <p className="text-muted-foreground">
                    You agree to provide accurate, current, and complete information during registration and keep it updated.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>3. Subscription & Payment</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <h4 className="font-semibold mt-4">Free Trial</h4>
                  <p className="text-muted-foreground">
                    All plans include a 14-day free trial. No credit card required. After the trial, you must choose a paid plan to continue service.
                  </p>

                  <h4 className="font-semibold mt-4">Billing</h4>
                  <ul className="text-muted-foreground">
                    <li>Plans are billed monthly in advance</li>
                    <li>Payments are processed on the same day each month</li>
                    <li>All fees are in USD</li>
                    <li>Prices may change with 30 days notice</li>
                  </ul>

                  <h4 className="font-semibold mt-4">Failed Payments</h4>
                  <p className="text-muted-foreground">
                    If payment fails, we'll notify you and retry. After 3 failed attempts, your account may be suspended. You'll have 7 days to update payment before data deletion.
                  </p>

                  <h4 className="font-semibold mt-4">Refunds</h4>
                  <p className="text-muted-foreground">
                    We offer pro-rated refunds if you cancel mid-month. No refunds for the free trial period or for services already rendered.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>4. Acceptable Use</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <h4 className="font-semibold mt-4 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    You May:
                  </h4>
                  <ul className="text-muted-foreground">
                    <li>Install the agent on computers you own or have permission to monitor</li>
                    <li>Use the service to protect your legitimate business operations</li>
                    <li>Export your own security data and reports</li>
                  </ul>

                  <h4 className="font-semibold mt-4 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    You May NOT:
                  </h4>
                  <ul className="text-muted-foreground">
                    <li>Install the agent on computers you don't own without permission</li>
                    <li>Use the service for illegal surveillance or monitoring</li>
                    <li>Attempt to reverse engineer, decompile, or hack our software</li>
                    <li>Resell or redistribute our service without written permission</li>
                    <li>Use the service to harm, harass, or violate others' privacy</li>
                    <li>Interfere with or disrupt our infrastructure</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    5. Service Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <h4 className="font-semibold mt-4">No Guarantee of Security</h4>
                  <p className="text-muted-foreground">
                    While we work hard to detect threats, <strong>no security system is 100% effective</strong>. SME CyberGuard is a monitoring and detection tool, not a guarantee against all cyber attacks.
                  </p>

                  <h4 className="font-semibold mt-4">Service Availability</h4>
                  <p className="text-muted-foreground">
                    We aim for 99.5% uptime but cannot guarantee uninterrupted service. Planned maintenance will be announced in advance.
                  </p>

                  <h4 className="font-semibold mt-4">Your Responsibilities</h4>
                  <ul className="text-muted-foreground">
                    <li>Keep Windows and other software updated</li>
                    <li>Use strong passwords and enable antivirus</li>
                    <li>Train employees on security best practices</li>
                    <li>Act promptly on alerts we send</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>6. Intellectual Property</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    SME CyberGuard owns all rights to our software, dashboard, AI models, and related intellectual property. You receive a limited, non-exclusive license to use our service.
                  </p>
                  <p className="text-muted-foreground mt-4">
                    <strong>Your data is yours.</strong> We don't claim ownership of your business data or security logs.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    7. Limitation of Liability
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>SME CyberGuard is provided "AS IS" without warranties of any kind</li>
                    <li>We are not liable for data loss, business interruption, or security breaches</li>
                    <li>Our total liability is limited to the fees you paid in the last 3 months</li>
                    <li>We are not responsible for third-party actions (hackers, etc.)</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Some jurisdictions don't allow liability limitations. If these apply to you, some of the above may not apply.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>8. Termination</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <h4 className="font-semibold mt-4">You Can Cancel Anytime</h4>
                  <p className="text-muted-foreground">
                    Cancel from your dashboard. Access continues until the end of your billing period.
                  </p>

                  <h4 className="font-semibold mt-4">We May Suspend Your Account If:</h4>
                  <ul className="text-muted-foreground">
                    <li>You violate these Terms</li>
                    <li>Your payment fails repeatedly</li>
                    <li>You use the service illegally</li>
                    <li>Required by law</li>
                  </ul>

                  <h4 className="font-semibold mt-4">After Termination</h4>
                  <p className="text-muted-foreground">
                    You have 30 days to export your data. After that, all data is permanently deleted.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>9. Governing Law</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    These Terms are governed by the laws of the United States. Any disputes will be resolved in the courts of New York, USA.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>10. Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground">
                    We may update these Terms occasionally. We'll notify you via email and in your dashboard. Continued use after changes means you accept the new Terms.
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
                    Questions about these Terms? Contact us:
                  </p>
                  <ul className="text-muted-foreground">
                    <li>Email: legal@smecyberguard.com</li>
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

export default Terms;
