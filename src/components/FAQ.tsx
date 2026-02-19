"use client";
import { motion } from "framer-motion";
import { HelpCircle, Shield, Laptop, CreditCard, Lock, Users } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/hooks/useCurrency";

const FAQ = () => {
  const navigate = useRouter();
  const { symbol, convertFromUSD, loading } = useCurrency();

  const formatPrice = (usdPrice: number) => {
    if (loading) return `$${usdPrice}`;
    const amount = convertFromUSD(usdPrice);
    return `${symbol}${amount.toLocaleString()}`;
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const categories = [
    {
      icon: Shield,
      title: "Security & Protection",
      questions: [
        {
          q: "How does SME CyberGuard protect my business?",
          a: "SME CyberGuard installs a lightweight agent on each Windows computer that monitors processes, network connections, and software. Our AI analyzes this data in real-time to detect threats like malware, phishing attempts, and suspicious activity. You get instant alerts and one-click fixes through your dashboard."
        },
        {
          q: "Will the agent slow down my computers?",
          a: "No. The agent uses less than 1% CPU and 50 MB RAM—that's about the same as opening a single browser tab. Your computers will run just as fast as before."
        },
        {
          q: "What happens if a threat is detected?",
          a: "You'll receive an instant alert via SMS, WhatsApp, or email (depending on your plan). The dashboard shows exactly what the threat is in plain English, which computer is affected, and provides a 'Fix Now' button for most issues. For critical threats, we can automatically quarantine the file."
        },
        {
          q: "Do I need antivirus software if I have SME CyberGuard?",
          a: "SME CyberGuard complements your existing antivirus but doesn't replace it. We focus on monitoring behavior and detecting threats that traditional antivirus might miss. We recommend keeping Windows Defender or your current antivirus active."
        }
      ]
    },
    {
      icon: Laptop,
      title: "Installation & Setup",
      questions: [
        {
          q: "How long does installation take?",
          a: "About 5 minutes per computer. Download the agent, run the installer, enter your activation code, and you're done. The agent installs in the background while you continue working."
        },
        {
          q: "What if I don't have administrator access?",
          a: "You'll need admin privileges to install the agent. If you're not the computer's administrator, ask your business owner or IT person to install it for you."
        },
        {
          q: "Can I install it on multiple computers?",
          a: "Yes! Your activation code works for all computers in your business (up to your plan limit). Download once, install on each PC."
        },
        {
          q: "Does it work on Mac or Linux?",
          a: "Currently, the agent only supports Windows 7 and newer. Mac and Linux support is coming in 2025. Sign up for updates to be notified when it's ready."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Pricing & Billing",
      questions: [
        {
          q: "How much does SME CyberGuard cost?",
          a: `We offer a free plan for basic protection, with paid plans starting at ${formatPrice(23)}/month for up to 10 devices. All plans include a 14-day free trial. Check our pricing page for full details.`
        },
        {
          q: "Is there a setup fee?",
          a: "No setup fees, no hidden costs. The price you see is what you pay."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept M-Pesa, bank transfers, and major credit cards (Visa, Mastercard). All payments are processed securely."
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes. Cancel anytime from your dashboard. You'll continue to have access until the end of your billing period. No cancellation fees."
        }
      ]
    },
    {
      icon: Lock,
      title: "Privacy & Data",
      questions: [
        {
          q: "What data do you collect?",
          a: "We collect system information (OS version, installed software), process names, network connections, and login events. We do NOT collect personal documents, emails, passwords, or browse your files."
        },
        {
          q: "Where is my data stored?",
          a: "All data is stored in secure, encrypted databases. We use Turso (libSQL) with end-to-end encryption. Your data is protected by international standards unless required by law."
        },
        {
          q: "Who can see my data?",
          a: "Only you and users you explicitly invite to your business account. Our team can only access your data with your written permission for support purposes."
        },
        {
          q: "Do you sell my data?",
          a: "Never. We will never sell, rent, or share your data with third parties. Your business information is yours alone."
        }
      ]
    },
    {
      icon: Users,
      title: "Support & Training",
      questions: [
        {
          q: "What kind of support do you offer?",
          a: "Free: Community support. Starter: Email support. Professional: Priority phone support. Enterprise: 24/7 dedicated support. All plans get access to our help center and video tutorials."
        },
        {
          q: "Do you train my employees?",
          a: "Yes! We include phishing simulation training in all plans. Professional and Enterprise plans get advanced training modules, and Enterprise plans include on-site training sessions for your entire team."
        },
        {
          q: "What if I need help outside business hours?",
          a: "Professional and Enterprise plans include WhatsApp support 24/7. Critical security issues are handled immediately."
        },
        {
          q: "What languages do you support?",
          a: "Our support team is fluent in English and multiple languages. All our training materials and videos include subtitles in various languages."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      
      <main className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-5xl">
          {/* Hero */}
          <motion.div {...fadeIn} className="text-center mb-16">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about protecting your business with SME CyberGuard
            </p>
          </motion.div>

          {/* Categories */}
          <div className="space-y-12">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                {...fadeIn}
                transition={{ delay: 0.1 * index }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, qIndex) => (
                        <AccordionItem key={qIndex} value={`item-${index}-${qIndex}`}>
                          <AccordionTrigger className="text-left">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div {...fadeIn} className="text-center mt-16 p-8 rounded-lg gradient-hero text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg mb-6 text-primary-foreground/90">
              Our support team is ready to help you understand how SME CyberGuard can protect your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => router.push("/contact")}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-glow"
              >
                Contact Support
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => router.push("/signup")}
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Start Free Trial
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
