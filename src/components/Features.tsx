"use client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Shield, Eye, Brain, Smartphone, Zap, Lock, Users, TrendingUp, AlertTriangle,
  FileSearch, Network, Activity, ChevronRight, Play, Star, Quote,
  CheckCircle, ArrowRight, Sparkles, Globe, Clock, Award
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/hooks/useCurrency";

const Features = () => {
  const navigate = useRouter();
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const { symbol, convertFromUSD, loading } = useCurrency();

  const formatPrice = (usdPrice: number) => {
    if (loading) return `$${usdPrice}/mo`;
    const amount = convertFromUSD(usdPrice);
    return `${symbol}${amount.toLocaleString()}/mo`;
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = {
    core: [
      {
        icon: Eye,
        title: "Real-Time Monitoring",
        description: "24/7 surveillance of every computer in your business",
        benefits: ["Monitor all running processes", "Track network connections", "Log user login activity", "Detect suspicious behavior instantly"],
        demo: "Live dashboard showing real-time activity across all devices",
        color: "from-blue-500 to-cyan-500"
      },
      {
        icon: Brain,
        title: "AI-Powered Threat Detection",
        description: "Machine learning that gets smarter every day",
        benefits: ["Detect malware and ransomware", "Identify phishing attempts", "Flag suspicious file downloads", "Learn your business patterns"],
        demo: "AI analyzing network traffic and flagging anomalies",
        color: "from-purple-500 to-pink-500"
      },
      {
        icon: TrendingUp,
        title: "Risk Score Dashboard",
        description: "See your security health at a glance",
        benefits: ["Live risk score (0-100)", "Historical trend charts", "Detailed risk breakdown", "Mobile-friendly interface"],
        demo: "Interactive dashboard with risk visualization",
        color: "from-green-500 to-emerald-500"
      },
      {
        icon: Smartphone,
        title: "Mobile-First Design",
        description: "Manage security from your phone",
        benefits: ["Fully responsive dashboard", "Works on 3G connections", "Optimized for various networks", "WhatsApp integration"],
        demo: "Mobile app interface showing security alerts",
        color: "from-orange-500 to-red-500"
      }
    ],
    business: [
      {
        icon: AlertTriangle,
        title: "Instant Threat Alerts",
        description: "Get notified the moment something's wrong",
        benefits: ["SMS alerts", "WhatsApp notifications", "Email summaries", "Severity-based prioritization"],
        demo: "Push notification system for immediate alerts",
        color: "from-red-500 to-pink-500"
      },
      {
        icon: Users,
        title: "Phishing Simulation",
        description: "Train your team with fake phishing attacks",
        benefits: ["Automated phishing emails", "Track who clicks suspicious links", "Individual employee training", "Monthly simulation campaigns"],
        demo: "Phishing campaign management dashboard",
        color: "from-indigo-500 to-purple-500"
      },
      {
        icon: FileSearch,
        title: "Software Inventory",
        description: "Know exactly what's installed on every computer",
        benefits: ["Complete software list", "Identify outdated programs", "Flag vulnerable versions", "Automatic update reminders"],
        demo: "Software inventory with vulnerability scanning",
        color: "from-teal-500 to-cyan-500"
      },
      {
        icon: Network,
        title: "Network Security Monitoring",
        description: "Watch what your computers are connecting to",
        benefits: ["Block malicious domains", "Detect data exfiltration", "Monitor external connections", "Flag suspicious IP addresses"],
        demo: "Network traffic monitoring interface",
        color: "from-yellow-500 to-orange-500"
      }
    ],
    enterprise: [
      {
        icon: Lock,
        title: "Automatic Threat Quarantine",
        description: "Isolate dangerous files before they cause damage",
        benefits: ["Instant file quarantine", "Process termination", "Restore false positives", "Detailed quarantine logs"],
        demo: "Automated quarantine system in action",
        color: "from-gray-500 to-slate-500"
      },
      {
        icon: Zap,
        title: "One-Click Remediation",
        description: "Fix security issues without technical knowledge",
        benefits: ["Guided fix instructions", "Automated update deployment", "Remote command execution", "Verify fixes applied"],
        demo: "One-click remediation workflow",
        color: "from-emerald-500 to-green-500"
      },
      {
        icon: Activity,
        title: "Detailed Reporting",
        description: "Understand your security posture",
        benefits: ["Weekly security reports", "Compliance summaries", "Employee training scores", "Custom report scheduling"],
        demo: "Comprehensive reporting dashboard",
        color: "from-violet-500 to-purple-500"
      },
      {
        icon: Shield,
        title: "Multi-Tenant Architecture",
        description: "Perfect for managing multiple locations",
        benefits: ["Separate business accounts", "Role-based access control", "Centralized management", "Location-based filtering"],
        demo: "Multi-location management interface",
        color: "from-blue-500 to-indigo-500"
      }
    ]
  };

  const testimonials = [
    {
      name: "Sarah Wanjiku",
      company: "Wanjiku Retail Chain",
      role: "IT Manager",
      content: "Since implementing SME CyberGuard, we've blocked over 50 phishing attempts and prevented a potential ransomware attack. The real-time monitoring gives us peace of mind.",
      rating: 5,
      avatar: "SW"
    },
    {
      name: "David Kiprop",
      company: "Kiprop Logistics Ltd",
      role: "Operations Director",
      content: "The mobile-first design is perfect for our drivers and field staff. We can monitor our entire fleet's security from anywhere worldwide.",
      rating: 5,
      avatar: "DK"
    },
    {
      name: "Grace Achieng",
      company: "Achieng Accounting Services",
      role: "Managing Partner",
      content: "The AI-powered threat detection caught a sophisticated malware attack that traditional antivirus missed. This system saved our business.",
      rating: 5,
      avatar: "GA"
    }
  ];

  const demoSlides = [
    {
      title: "Real-Time Threat Detection",
      description: "Watch as our AI detects and blocks a simulated cyber attack in real-time",
      image: "/placeholder.svg",
      features: ["Live monitoring", "Instant alerts", "Automated response"]
    },
    {
      title: "Risk Score Dashboard",
      description: "Interactive dashboard showing your security health across all devices",
      image: "/placeholder.svg",
      features: ["Visual risk assessment", "Trend analysis", "Actionable insights"]
    },
    {
      title: "Mobile Security Management",
      description: "Manage your entire security posture from your smartphone",
      image: "/placeholder.svg",
      features: ["Mobile-optimized", "WhatsApp alerts", "Remote management"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <LandingNavbar />

      <main className="pt-24 pb-16 px-4 flex-1 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-40 left-10 w-24 h-24 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl"
          />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Enhanced Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Complete Protection Suite
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
            >
              Enterprise Security<br />
              <span className="text-blue-600">Built for SMEs</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Everything you need to protect your business from cyber threats, in one simple platform.
              Trusted by over 500 businesses.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/pricing")}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                View Pricing
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive Demo Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience our security platform through interactive demonstrations
              </p>
            </div>

            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {demoSlides.map((slide, index) => (
                  <CarouselItem key={index}>
                    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50">
                      <CardContent className="p-8">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                          <div>
                            <h3 className="text-2xl font-bold mb-4">{slide.title}</h3>
                            <p className="text-muted-foreground mb-6">{slide.description}</p>
                            <div className="space-y-2">
                              {slide.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                            <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                              <Play className="mr-2 h-4 w-4" />
                              Watch Demo
                            </Button>
                          </div>
                          <div className="relative">
                            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center shadow-inner">
                              <div className="text-center">
                                <Play className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                                <p className="text-muted-foreground">Interactive Demo</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </motion.div>

          {/* Feature Categories with Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Security Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the features that match your business needs and scale as you grow
              </p>
            </div>

            <Tabs defaultValue="core" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="core" className="text-sm font-medium">Core Features</TabsTrigger>
                <TabsTrigger value="business" className="text-sm font-medium">Business+</TabsTrigger>
                <TabsTrigger value="enterprise" className="text-sm font-medium">Enterprise</TabsTrigger>
              </TabsList>

              {Object.entries(features).map(([category, categoryFeatures]) => (
                <TabsContent key={category} value={category}>
                  <motion.div
                    variants={stagger}
                    initial="initial"
                    animate="animate"
                    className="grid md:grid-cols-2 lg:grid-cols-2 gap-6"
                  >
                    {categoryFeatures.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        variants={fadeIn}
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Card className="h-full group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between mb-4">
                              <motion.div
                                className={`h-14 w-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
                                whileHover={{ rotate: 5, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              >
                                <feature.icon className="h-7 w-7 text-white" />
                              </motion.div>
                              <Badge
                                variant={category === 'core' ? 'default' : category === 'business' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {category === 'core' ? 'Core Feature' : category === 'business' ? 'Business+' : 'Enterprise'}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                              {feature.title}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {feature.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="benefits" className="border-0">
                                <AccordionTrigger className="text-sm font-medium hover:text-blue-600">
                                  View Benefits
                                </AccordionTrigger>
                                <AccordionContent>
                                  <ul className="space-y-3 mt-4">
                                    {feature.benefits.map((benefit, i) => (
                                      <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-3 text-sm"
                                      >
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{benefit}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700 font-medium">Demo: {feature.demo}</p>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Businesses</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how SME CyberGuard is protecting businesses worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Quote className="h-8 w-8 text-blue-600 mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        "{testimonial.content}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Feature Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold mb-4">Choose Your Protection Level</CardTitle>
                <CardDescription className="text-lg">
                  All plans include core protection features. Upgrade for advanced capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4 px-6 text-lg font-semibold">Feature</th>
                        <th className="text-center py-4 px-6">
                          <div className="text-lg font-semibold">Free</div>
                          <div className="text-sm text-muted-foreground">$0</div>
                        </th>
                        <th className="text-center py-4 px-6">
                          <div className="text-lg font-semibold text-blue-600">Starter</div>
                          <div className="text-sm text-muted-foreground">{formatPrice(23)}</div>
                        </th>
                        <th className="text-center py-4 px-6">
                          <div className="text-lg font-semibold text-purple-600">Professional</div>
                          <div className="text-sm text-muted-foreground">{formatPrice(46)}</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { feature: "Real-time monitoring", free: true, starter: true, professional: true },
                        { feature: "AI threat detection", free: true, starter: true, professional: true },
                        { feature: "Risk score dashboard", free: true, starter: true, professional: true },
                        { feature: "Mobile app", free: true, starter: true, professional: true },
                        { feature: "Email alerts", free: true, starter: true, professional: true },
                        { feature: "Basic phishing protection", free: false, starter: true, professional: true },
                        { feature: "Weekly security reports", free: false, starter: true, professional: true },
                        { feature: "Email support", free: false, starter: true, professional: true },
                        { feature: "SMS + WhatsApp alerts", free: false, starter: false, professional: true },
                        { feature: "Phishing simulations", free: false, starter: false, professional: true },
                        { feature: "Automatic quarantine", free: false, starter: false, professional: true },
                        { feature: "Priority phone support", free: false, starter: false, professional: true },
                        { feature: "Compliance monitoring", free: false, starter: false, professional: true }
                      ].map((row, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium">{row.feature}</td>
                          <td className="text-center py-4 px-6">
                            {row.free ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-muted-foreground">–</span>}
                          </td>
                          <td className="text-center py-4 px-6">
                            {row.starter ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-muted-foreground">–</span>}
                          </td>
                          <td className="text-center py-4 px-6">
                            {row.professional ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto" /> : <span className="text-muted-foreground">–</span>}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Multiple CTAs Throughout */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Award className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
                  <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Business?</h2>
                  <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
                    Join over 500 SMEs already protected by our comprehensive security platform.
                    Start your free trial today.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      onClick={() => router.push("/signup")}
                      className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      Start Free 14-Day Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => router.push("/contact")}
                      className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold transition-all duration-300"
                    >
                      Schedule Demo
                    </Button>
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-blue-100">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Setup in under 5 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Works anywhere</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Bank-level security</span>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
