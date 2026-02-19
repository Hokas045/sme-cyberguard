"use client";

import { motion } from "framer-motion";
import { Check, Shield, Zap, Crown, Star, Users, TrendingUp, Lock, AlertTriangle, Phone, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/hooks/useCurrency";

const Pricing = () => {
  const router = useRouter();
  const [showComparison, setShowComparison] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { code, symbol, convertFromUSD, loading } = useCurrency();

  const formatPrice = (usdPrice: string) => {
    if (loading) return `$${usdPrice}`;
    const amount = convertFromUSD(parseFloat(usdPrice));
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatSavings = (usdSavings: number) => {
    if (loading) return `Save $${usdSavings}`;
    const amount = convertFromUSD(usdSavings);
    return `Save ${symbol}${amount.toLocaleString()}`;
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

  const plans = [
    {
      name: "Free",
      icon: Shield,
      price: "0",
      period: "forever",
      description: "Basic cybersecurity protection for startups and very small businesses",
      features: [
        { name: "Up to 5 devices", highlight: false },
        { name: "Basic threat monitoring", highlight: false },
        { name: "Risk score dashboard", highlight: false },
        { name: "Email alerts", highlight: false },
        { name: "Community support", highlight: false }
      ],
      cta: "Get Started Free",
      popular: false,
      savings: null
    },
    {
      name: "Starter",
      icon: Shield,
      price: billingCycle === 'monthly' ? "23" : "248",
      period: billingCycle === 'monthly' ? "per month" : "per year",
      description: "Essential protection for small businesses with up to 10 computers",
      features: [
        { name: "Up to 10 devices", highlight: false },
        { name: "Real-time threat monitoring", highlight: false },
        { name: "Risk score dashboard", highlight: false },
        { name: "Email alerts", highlight: false },
        { name: "Basic phishing protection", highlight: false },
        { name: "Weekly security reports", highlight: false },
        { name: "Email support", highlight: false }
      ],
      cta: "Start Free Trial",
      popular: false,
      savings: billingCycle === 'yearly' ? 28 : null
    },
    {
      name: "Professional",
      icon: Zap,
      price: billingCycle === 'monthly' ? "46" : "496",
      period: billingCycle === 'monthly' ? "per month" : "per year",
      description: "Advanced security for growing SMEs with up to 25 computers",
      features: [
        { name: "Up to 25 devices", highlight: true },
        { name: "Everything in Starter", highlight: false },
        { name: "Advanced threat detection", highlight: true },
        { name: "SMS + WhatsApp alerts", highlight: false },
        { name: "Phishing simulation campaigns", highlight: false },
        { name: "Daily detailed reports", highlight: false },
        { name: "Priority phone support", highlight: false },
        { name: "Remote security commands", highlight: false },
        { name: "Compliance monitoring", highlight: true }
      ],
      cta: "Start Free Trial",
      popular: true,
      savings: billingCycle === 'yearly' ? 56 : null
    },
    {
      name: "Enterprise",
      icon: Crown,
      price: "Custom",
      period: "contact us",
      description: "Comprehensive security solutions for large organizations",
      features: [
        { name: "Unlimited devices", highlight: true },
        { name: "Everything in Professional", highlight: false },
        { name: "Dedicated security analyst", highlight: true },
        { name: "Custom API integrations", highlight: false },
        { name: "Advanced compliance reports", highlight: false },
        { name: "24/7 phone support", highlight: false },
        { name: "On-site security training", highlight: false },
        { name: "Custom SLA agreements", highlight: true }
      ],
      cta: "Contact Sales",
      popular: false,
      savings: null
    }
  ];

  const testimonials = [
    {
      name: "Sarah Wanjiku",
      company: "Wanjiku Retail Ltd",
      plan: "Starter",
      quote: "SME CyberGuard has been a game-changer for our small shop. We now sleep peacefully knowing our data is protected.",
      rating: 5
    },
    {
      name: "David Kiprop",
      company: "Kiprop Logistics",
      plan: "Professional",
      quote: "The professional plan's advanced features helped us detect and prevent a major cyber attack. Worth every dollar!",
      rating: 5
    },
    {
      name: "Grace Achieng",
      company: "Achieng Manufacturing",
      plan: "Enterprise",
      quote: "As we grew, so did our security needs. The enterprise solution scaled perfectly with our business.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How does SME CyberGuard protect against cyber threats specific to small businesses?",
      answer: "We understand the unique cyber landscape for small businesses, including phishing tactics, ransomware targeting SMEs, and supply chain attacks. Our AI-powered system is trained on threat patterns and provides protection strategies."
    },
    {
      question: "What makes your pricing affordable for small businesses?",
      answer: `We offer a free plan for basic protection, with paid plans starting at just ${formatPrice("23")}/month. No setup fees, ever. Our plans are designed to scale with your business growth.`
    },
    {
      question: "Do you provide training for our staff on cybersecurity best practices?",
      answer: "Yes! All plans include basic cybersecurity awareness training. Professional and Enterprise plans include advanced training modules, and Enterprise customers get on-site training sessions."
    },
    {
      question: "How quickly can you respond to security incidents?",
      answer: "Our monitoring is 24/7. Critical incidents are addressed within 15 minutes for Professional plans and immediately for Enterprise customers with dedicated analysts."
    },
    {
      question: "Can I switch plans as my business grows?",
      answer: "Absolutely! You can upgrade or downgrade at any time. We offer prorated billing and seamless migration to ensure your protection continues uninterrupted."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept bank transfers, Visa, Mastercard, and American Express. All payments are processed securely."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      <main className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <motion.div {...fadeIn} className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">Secure Your SME Today</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Cybersecurity That Understands Small Business
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
              Protect your business from cyber threats with affordable security solutions.
              Join 500+ SMEs already safeguarding their digital future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="shadow-glow"
              >
                Start Your Free Trial
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                14-day free trial • No credit card required
              </div>
            </div>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div {...fadeIn} className="flex justify-center items-center gap-4 mb-12">
            <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>Monthly</span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
              Yearly
              <Badge className="ml-2 bg-green-100 text-green-800">Save up to 10%</Badge>
            </span>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div {...stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                {...fadeIn}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={`relative ${plan.popular ? "border-primary shadow-glow scale-105" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  {plan.savings !== null && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-100 text-green-800">{formatSavings(plan.savings)}</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <plan.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold">
                        {plan.price === "Custom" ? "Custom" : formatPrice(plan.price)}
                      </span>
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <span className={`text-sm ${feature.highlight ? 'font-semibold text-primary' : ''}`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={plan.popular ? "w-full shadow-glow" : "w-full"}
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => plan.cta === "Contact Sales" ? router.push("/contact") : router.push("/signup")}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Plan Comparison Toggle */}
          <motion.div {...fadeIn} className="text-center mb-8">
            <Button
              variant="outline"
              onClick={() => setShowComparison(!showComparison)}
              className="mb-4"
            >
              {showComparison ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Plan Comparison
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Compare All Plans
                </>
              )}
            </Button>
          </motion.div>

          {/* Interactive Comparison */}
          {showComparison && (
            <motion.div {...fadeIn} className="mb-16">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Detailed Plan Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4">Features</th>
                          <th className="text-center py-4">Free</th>
                          <th className="text-center py-4">Starter</th>
                          <th className="text-center py-4">Professional</th>
                          <th className="text-center py-4">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          "Number of Devices",
                          "Real-time Monitoring",
                          "Risk Dashboard",
                          "Email Alerts",
                          "SMS/WhatsApp Alerts",
                          "Phishing Protection",
                          "Advanced Threat Detection",
                          "Security Reports",
                          "Priority Support",
                          "Dedicated Analyst",
                          "Custom Integrations",
                          "24/7 Support"
                        ].map((feature, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-3 font-medium">{feature}</td>
                            <td className="text-center py-3">
                              {index < 4 ? <Check className="h-5 w-5 text-success mx-auto" /> : <span className="text-muted-foreground">-</span>}
                            </td>
                            <td className="text-center py-3">
                              {index < 7 ? <Check className="h-5 w-5 text-success mx-auto" /> : <span className="text-muted-foreground">-</span>}
                            </td>
                            <td className="text-center py-3">
                              {index < 12 ? <Check className="h-5 w-5 text-success mx-auto" /> : <span className="text-muted-foreground">-</span>}
                            </td>
                            <td className="text-center py-3">
                              <Check className="h-5 w-5 text-success mx-auto" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Testimonials */}
          <motion.div {...fadeIn} className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Trusted by Businesses</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  {...fadeIn}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                        <Badge variant="outline" className="mt-2">{testimonial.plan} Plan</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div {...fadeIn} className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div {...fadeIn} className="text-center p-8 rounded-lg gradient-hero text-primary-foreground mb-16">
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Business?</h2>
            <p className="text-lg mb-6 text-primary-foreground/90">
              Join hundreds of SMEs protecting their digital assets. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-glow"
              >
                Start Free Trial Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/contact")}
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Talk to Sales
              </Button>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                No setup fees
              </div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div {...fadeIn} className="text-center">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our team of cybersecurity experts is here to help you choose the perfect plan for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.push("/contact")}>
                <Phone className="h-4 w-4 mr-2" />
                Call Us: +254 700 123 456
              </Button>
              <Button variant="outline" onClick={() => router.push("/contact")}>
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
