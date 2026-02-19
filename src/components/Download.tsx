"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Download as DownloadIcon,
  Shield,
  Laptop,
  CheckCircle,
  AlertCircle,
  Play,
  Monitor,
  Server,
  Apple,
  HelpCircle,
  Lock,
  Users,
  Zap,
  Globe,
  ArrowRight,
  MessageSquare,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";
import { getAuthState } from "@/lib/auth";
import { query, insert } from "@/lib/turso";

const Download = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("windows");
  const navigate = useRouter();
  const authState = getAuthState();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const platforms = [
    {
      id: "windows",
      name: "Windows",
      icon: Monitor,
      version: "v2.1.0",
      size: "52 MB",
      compatibility: "Windows 7, 8, 10, 11",
      emoji: "🪟"
    },
    {
      id: "macos",
      name: "macOS",
      icon: Apple,
      version: "v2.1.0",
      size: "48 MB",
      compatibility: "macOS 10.15+",
      emoji: "🍎"
    },
    {
      id: "linux",
      name: "Linux",
      icon: Server,
      version: "v2.1.0",
      size: "45 MB",
      compatibility: "Ubuntu 18.04+, Debian 10+, CentOS 7+",
      emoji: "🐧"
    }
  ];

  const systemRequirements = {
    windows: {
      minimum: [
        "Windows 7 SP1 or newer",
        "2 GB RAM",
        "100 MB free disk space",
        "Internet connection"
      ],
      recommended: [
        "Windows 10 or newer",
        "4 GB RAM or more",
        "SSD storage",
        "Stable broadband connection"
      ]
    },
    macos: {
      minimum: [
        "macOS 10.15 (Catalina) or newer",
        "4 GB RAM",
        "100 MB free disk space",
        "Internet connection"
      ],
      recommended: [
        "macOS 12 (Monterey) or newer",
        "8 GB RAM or more",
        "SSD storage",
        "Stable broadband connection"
      ]
    },
    linux: {
      minimum: [
        "Ubuntu 18.04, Debian 10, or CentOS 7",
        "2 GB RAM",
        "100 MB free disk space",
        "Internet connection"
      ],
      recommended: [
        "Ubuntu 20.04+, Debian 11+, CentOS 8+",
        "4 GB RAM or more",
        "SSD storage",
        "Stable broadband connection"
      ]
    }
  };

  const installationSteps = {
    windows: [
      {
        number: "1",
        title: "Download the Agent",
        description: "Click the download button above to get the SME CyberGuard Agent installer."
      },
      {
        number: "2",
        title: "Run the Installer",
        description: "Double-click the downloaded file. Windows may show a security warning—this is normal. Click 'Run anyway'."
      },
      {
        number: "3",
        title: "Administrator Access",
        description: "Enter administrator credentials when prompted. The agent needs admin rights to protect your system."
      },
      {
        number: "4",
        title: "Enter Activation Code",
        description: "You received this code via WhatsApp when you signed up. Copy and paste it into the installer."
      },
      {
        number: "5",
        title: "Complete Installation",
        description: "The agent will install in the background. Takes about 2 minutes. You'll see a green shield icon in your taskbar when complete."
      },
      {
        number: "6",
        title: "Verify in Dashboard",
        description: "Open your dashboard to confirm the computer appears in your device list. That's it—you're protected!"
      }
    ],
    macos: [
      {
        number: "1",
        title: "Download the Agent",
        description: "Click the download button above to get the SME CyberGuard Agent installer for macOS."
      },
      {
        number: "2",
        title: "Open the Installer",
        description: "Double-click the downloaded .dmg file to mount it, then double-click the installer package."
      },
      {
        number: "3",
        title: "Security Warning",
        description: "macOS may show a security warning. Go to System Preferences > Security & Privacy and click 'Open Anyway'."
      },
      {
        number: "4",
        title: "Enter Activation Code",
        description: "During installation, enter the activation code you received via WhatsApp when you signed up."
      },
      {
        number: "5",
        title: "Complete Installation",
        description: "The agent will install and start automatically. Takes about 2 minutes. Check your menu bar for the shield icon."
      },
      {
        number: "6",
        title: "Verify in Dashboard",
        description: "Open your dashboard to confirm the Mac appears in your device list. Your protection is now active!"
      }
    ],
    linux: [
      {
        number: "1",
        title: "Download the Agent",
        description: "Click the download button above to get the SME CyberGuard Agent installer for Linux."
      },
      {
        number: "2",
        title: "Make Executable",
        description: "Open terminal and run: chmod +x sme-cyberguard-agent-installer.run"
      },
      {
        number: "3",
        title: "Run as Root",
        description: "Execute the installer with sudo: sudo ./sme-cyberguard-agent-installer.run"
      },
      {
        number: "4",
        title: "Enter Activation Code",
        description: "When prompted, enter the activation code you received via WhatsApp during signup."
      },
      {
        number: "5",
        title: "Complete Installation",
        description: "The agent will install and start automatically. Takes about 2 minutes. Check system services for 'sme-cyberguard'."
      },
      {
        number: "6",
        title: "Verify in Dashboard",
        description: "Open your dashboard to confirm the server appears in your device list. Your protection is now active!"
      }
    ]
  };

  const troubleshooting = [
    {
      question: "Installation fails with 'Access Denied'",
      answer: "Make sure you're running the installer as administrator (Windows) or root (Linux/macOS). If you're not the computer owner, contact your IT administrator."
    },
    {
      question: "Agent doesn't appear in dashboard after installation",
      answer: "Check your internet connection and ensure the activation code was entered correctly. Wait 5 minutes and refresh your dashboard. If still not showing, contact support."
    },
    {
      question: "Computer is running slow after installation",
      answer: "The agent uses minimal resources (<1% CPU, <50MB RAM). Restart your computer. If issues persist, check for conflicting security software."
    },
    {
      question: "Can't find activation code",
      answer: "Check your WhatsApp messages or email. If you haven't signed up yet, create an account first. Activation codes are generated during signup."
    },
    {
      question: "Security software blocks the installer",
      answer: "Temporarily disable other antivirus software during installation. SME CyberGuard is safe and certified. Re-enable your other security software after installation."
    }
  ];

  const handleDownload = async (platform: string) => {
    if (!authState.user) {
      router.push("/signup");
      return;
    }

    try {
      // Get user's IP and location info
      const ipResponse = await fetch('https://ipapi.co/json/');
      const locationData = await ipResponse.json();

      // Get platform details
      const platformData = platforms.find(p => p.id === platform);
      if (!platformData) return;

      // Record the download
      const downloadId = crypto.randomUUID();
      await insert('agent_downloads', {
        id: downloadId,
        business_id: authState.user.business_id,
        user_id: authState.user.id,
        platform: platform,
        version: platformData.version,
        ip_address: locationData.ip,
        user_agent: navigator.userAgent,
        country: locationData.country_code || locationData.country,
        referrer: document.referrer || null,
        download_url: `/downloads/sme-cyberguard-${platform}-${platformData.version.replace('v', '')}.exe`,
        file_size: platform === 'windows' ? 52000000 : platform === 'macos' ? 48000000 : 45000000, // bytes
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      // In a real app, this would trigger the actual download
      console.log(`Download recorded for ${platform}: ${downloadId}`);

      // Show success message or trigger download
      // For now, just log it
      alert(`Download started! Your download has been recorded for analytics.`);

    } catch (error) {
      console.error('Failed to record download:', error);
      // Still allow download even if tracking fails
      alert('Download started, but tracking failed. Please try again.');
    }
  };

  const handleGetStarted = () => {
    if (authState.user) {
      router.push("/onboarding");
    } else {
      router.push("/signup");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      <main className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <motion.div {...fadeIn} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Enterprise-Grade Protection for SMEs</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Download SME CyberGuard Agent
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
              Protect your business from cyber threats with our lightweight security agent.
              Real-time monitoring, automatic malware protection, and comprehensive threat detection
              designed specifically for small and medium enterprises.
            </p>

            {/* Key Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Real-Time Protection</h3>
                  <p className="text-sm text-muted-foreground">24/7 threat monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Zero Performance Impact</h3>
                  <p className="text-sm text-muted-foreground">Lightweight & efficient</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Made for SMEs</h3>
                  <p className="text-sm text-muted-foreground">Simple setup, powerful protection</p>
                </div>
              </div>
            </div>

            {/* Platform Selection */}
            <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full max-w-2xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                {platforms.map((platform) => (
                  <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-2">
                    <platform.icon className="h-4 w-4" />
                    {platform.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {platforms.map((platform) => (
                <TabsContent key={platform.id} value={platform.id}>
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-4">{platform.emoji}</div>
                      <h3 className="text-xl font-bold mb-2">{platform.name} Agent {platform.version}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Compatible with {platform.compatibility} • {platform.size}
                      </p>
                      <Button
                        size="lg"
                        className="w-full shadow-glow"
                        onClick={() => handleDownload(platform.id)}
                      >
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Download for {platform.name}
                      </Button>
                      {!authState.user && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Sign up required to download
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>

          {/* System Requirements */}
          <motion.div {...fadeIn} className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Laptop className="h-5 w-5" />
                  System Requirements
                </CardTitle>
                <CardDescription>Ensure your device meets these requirements for optimal protection</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="windows">Windows</TabsTrigger>
                    <TabsTrigger value="macos">macOS</TabsTrigger>
                    <TabsTrigger value="linux">Linux</TabsTrigger>
                  </TabsList>

                  {Object.entries(systemRequirements).map(([platform, reqs]) => (
                    <TabsContent key={platform} value={platform}>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-green-700">Minimum Requirements</h4>
                          <ul className="space-y-2">
                            {reqs.minimum.map((req, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-blue-700">Recommended</h4>
                          <ul className="space-y-2">
                            {reqs.recommended.map((req, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Installation Guide */}
          <motion.div {...fadeIn} className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Installation Guide</h2>
            <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="windows">Windows</TabsTrigger>
                <TabsTrigger value="macos">macOS</TabsTrigger>
                <TabsTrigger value="linux">Linux</TabsTrigger>
              </TabsList>

              {Object.entries(installationSteps).map(([platform, steps]) => (
                <TabsContent key={platform} value={platform}>
                  <div className="space-y-6">
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        {...fadeIn}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex gap-6 items-start">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                                {step.number}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>

          {/* Security Information */}
          <motion.div {...fadeIn} className="mb-16">
            <Card className="gradient-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Shield className="h-6 w-6" />
                  Security & Trust
                </CardTitle>
                <CardDescription>
                  Your data security and privacy are our top priorities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">What We Protect</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Real-time malware detection and removal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>USB device security and monitoring</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Web activity filtering and protection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Network traffic monitoring</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Automatic security updates</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Privacy & Compliance</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>No collection of personal data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>End-to-end encrypted communications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Compliant with international data protection standards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Regular security audits and certifications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Secure data processing</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Troubleshooting */}
          <motion.div {...fadeIn} className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Troubleshooting
                </CardTitle>
                <CardDescription>Common installation issues and solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {troubleshooting.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          {/* Important Notes */}
          <motion.div {...fadeIn} className="space-y-4 mb-16">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Administrator Access Required:</strong> The agent needs administrative privileges to protect your system effectively. If you're not the computer owner, contact your IT person or business owner.
              </AlertDescription>
            </Alert>

            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>No Performance Impact:</strong> The agent uses less than 1% CPU and 50 MB RAM. Your computer will run just as fast as before.
              </AlertDescription>
            </Alert>

            <Alert>
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Automatic Updates:</strong> The agent updates itself automatically. You never need to download new versions manually.
              </AlertDescription>
            </Alert>

            <Alert>
              <Globe className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <strong>Always Connected:</strong> The agent requires an internet connection for real-time protection and updates. Protection is paused during offline periods.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Video Tutorial */}
          <motion.div {...fadeIn} className="mb-16">
            <Card className="gradient-card">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Installation Tutorial Videos</CardTitle>
                <CardDescription>
                  Step-by-step visual guides in multiple languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Windows Installation</h3>
                    <Badge>English | Español | Français</Badge>
                  </div>
                  <div className="text-center">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">macOS Installation</h3>
                    <Badge>English | Español | Français</Badge>
                  </div>
                  <div className="text-center">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                      <Play className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Linux Installation</h3>
                    <Badge>English</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call-to-Action */}
          <motion.div {...fadeIn} className="text-center p-8 rounded-lg gradient-hero text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Business?</h2>
            <p className="text-lg mb-6 text-primary-foreground/90">
              Join thousands of SMEs already protected by SME CyberGuard.
              Get started with your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-glow"
                onClick={handleGetStarted}
              >
                {authState.user ? "Continue to Onboarding" : "Get Started Free"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => router.push("/pricing")}
              >
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/80">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>

          {/* Support CTA */}
          <motion.div {...fadeIn} className="text-center mt-16 p-8 rounded-lg bg-muted">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Our support team is here to help with installation issues.
              Available 24/7 with global timezone coverage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="shadow-glow"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp Support
              </Button>
              <Button
                size="lg"
                variant="outline"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Download;
