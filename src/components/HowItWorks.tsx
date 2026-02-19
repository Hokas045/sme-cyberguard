"use client";
import { Shield, Brain, BarChart3, Download, Settings, CheckCircle, ArrowRight, Play, Users, Building, Truck, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  const router = useRouter();

  const steps = [
    {
      icon: Download,
      title: "Sign Up & Download",
      description: "Create your account in 2 minutes. Receive a unique activation code via WhatsApp or SMS.",
      detailedDescription: "Whether you're running a small retail shop or a logistics company, getting started is simple. Our support team ensures you're set up correctly from day one.",
      color: "text-primary",
      illustration: "📱",
      businessContext: "Perfect for busy entrepreneurs who need protection without the hassle."
    },
    {
      icon: Settings,
      title: "Install the Agent",
      description: "Download and install our lightweight agent on each Windows PC. Takes just 5 minutes per computer.",
      detailedDescription: "Our agent is designed for small businesses - it works on older Windows versions common in SMEs, requires minimal internet, and doesn't interfere with your daily operations.",
      color: "text-primary",
      illustration: "💻",
      businessContext: "Works seamlessly with POS systems, accounting software, and other business tools used worldwide."
    },
    {
      icon: Shield,
      title: "You Start Monitoring",
      description: "The agent begins silently monitoring processes, network connections, and software. All data remains encrypted and secure.",
      detailedDescription: "From the moment installation completes, your business is protected. We monitor for ransomware, phishing attempts, and unusual activity that could affect your operations.",
      color: "text-primary",
      illustration: "👁️",
      businessContext: "Real-time protection for retail shops, offices, and remote workers worldwide."
    },
    {
      icon: Brain,
      title: "AI Analyzes Threats",
      description: "Our AI brain processes all data, detects threats, and calculates your business risk score in real-time.",
      detailedDescription: "Using advanced machine learning trained on global threat patterns, our AI understands small business environments and common attack vectors targeting SMEs.",
      color: "text-primary",
      illustration: "🤖",
      businessContext: "Recognizes threats specific to small businesses, from phishing scams to international ransomware."
    },
    {
      icon: BarChart3,
      title: "Get Smart Alerts",
      description: "Check your dashboard anytime on your phone. Receive instant alerts for critical threats via WhatsApp or SMS.",
      detailedDescription: "Our mobile-first dashboard shows threats in plain English, with actionable recommendations. Get notified immediately if something suspicious happens.",
      color: "text-primary",
      illustration: "📊",
      businessContext: "Stay protected even when you're traveling between branches or working remotely in different locations."
    },
    {
      icon: CheckCircle,
      title: "One-Click Fixes",
      description: "Most threats can be resolved with a single click. No technical knowledge required - we handle the complexity.",
      detailedDescription: "Our automated fixes quarantine threats, update software, and restore systems. For complex issues, our support team is just a call away.",
      color: "text-success",
      illustration: "✅",
      businessContext: "Designed for non-technical business owners who need reliable protection without IT headaches."
    }
  ];

  const businessScenarios = [
    {
      icon: ShoppingCart,
      title: "Retail Shops",
      description: "Protect your retail shop from POS malware and customer data breaches."
    },
    {
      icon: Building,
      title: "Offices",
      description: "Secure your office from ransomware that could halt business operations."
    },
    {
      icon: Truck,
      title: "Logistics",
      description: "Keep your delivery routes safe from GPS tracking malware and operational disruptions."
    },
    {
      icon: Users,
      title: "Remote Teams",
      description: "Ensure your distributed workforce stays protected wherever they work."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      <main className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-7xl">
          {/* Enhanced Hero Section */}
          <div className="text-center mb-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl -z-10"></div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Play className="h-4 w-4" />
                Watch the 2-minute setup video
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cybersecurity Made Simple for SMEs
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              No IT experts needed. No complex jargon. Set up in 30 minutes and protect your business from cyber threats that could cost you thousands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Free Protection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-2 hover:bg-primary/5 transition-all duration-300"
              >
                See Live Demo
              </Button>
            </div>
          </div>

          {/* Simple Timeline */}
          <div className="relative mb-20">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-secondary"></div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 border-border hover:border-primary/50">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Timeline Node */}
                      <div className="relative z-10 h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-lg">
                        <step.icon className="h-8 w-8" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold">{step.title}</h3>
                          <span className="text-sm font-medium text-primary">Step {index + 1}</span>
                        </div>

                        <p className="text-lg text-muted-foreground mb-4">{step.description}</p>

                        {/* Static Content */}
                        <div className="pt-4 border-t border-border">
                          <div className="flex items-start gap-4 mb-4">
                            <span className="text-4xl">{step.illustration}</span>
                            <div>
                              <p className="text-muted-foreground mb-2">{step.detailedDescription}</p>
                              <p className="text-sm font-medium text-primary">{step.businessContext}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Business Scenarios */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Built for Small Businesses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessScenarios.map((scenario, index) => (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow border-primary/20">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                      <scenario.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{scenario.title}</h3>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-12 text-primary-foreground">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Business?</h2>
                <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                  Join thousands of SMEs worldwide who trust SME CyberGuard. Setup takes 30 minutes. Protection is instant.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button
                    size="lg"
                    onClick={() => router.push("/signup")}
                    className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Start Free Trial Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/contact")}
                    className="border-white text-white hover:bg-white/10 transition-all duration-300"
                  >
                    Talk to Our Team
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-8 text-sm text-primary-foreground/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>14-Day Free Trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>No Setup Fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
