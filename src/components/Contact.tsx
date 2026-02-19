"use client";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageSquare, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";
import { useCurrency } from "@/hooks/useCurrency";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  company: z.string().min(2, "Company must be at least 2 characters").max(100),
  phone: z.string().max(20).optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      contactSchema.parse({ name, email, company, phone, subject, message });
      
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      
      <main className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div {...fadeIn} className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get in Touch with Leading SME Cybersecurity Experts
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Trusted by over 1,000 businesses. Get expert cybersecurity support with guaranteed 24-hour response times.
            </p>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span>1,000+ SMEs Protected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>24/7 Emergency Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>Response within 4 hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Global Presence</span>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Contact Info Cards */}
            <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
              <Card className="h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-sm text-muted-foreground">Mon-Fri 8AM-6PM EST</p>
                    <a href="tel:+1555000000" className="text-primary hover:underline mt-2 inline-block">
                      +1 555 000 000
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <Card className="h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">24/7 instant support</p>
                    <a href="https://wa.me/1555000000" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-2 inline-block">
                      Chat Now
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
              <Card className="h-full">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">Response within 24 hours</p>
                    <a href="mailto:hello@smecyberguard.com" className="text-primary hover:underline mt-2 inline-block">
                      hello@smecyberguard.com
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div {...fadeIn}>
              <Card>
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@business.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        placeholder="ABC Enterprises Ltd"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 555 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={subject} onValueChange={setSubject} required>
                        <SelectTrigger>
                          <SelectValue placeholder="What can we help with?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us how we can help..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full shadow-glow" disabled={isLoading}>
                      <Send className="h-4 w-4 mr-2" />
                      {isLoading ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Office Info & Hours */}
            <motion.div {...fadeIn} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Our Global Offices
                  </CardTitle>
                  <CardDescription>
                    Global presence to serve SMEs worldwide
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="border-l-4 border-primary pl-4">
                      <h4 className="font-semibold mb-1">New York Headquarters</h4>
                      <p className="text-sm text-muted-foreground">
                        123 Business Park<br />
                        New York, NY, USA<br />
                        <span className="text-primary">+1 555 000 000</span>
                      </p>
                    </div>
                    <div className="border-l-4 border-primary/60 pl-4">
                      <h4 className="font-semibold mb-1">London Branch</h4>
                      <p className="text-sm text-muted-foreground">
                        456 Business Street<br />
                        London, UK<br />
                        <span className="text-primary">+44 20 0000 0000</span>
                      </p>
                    </div>
                    <div className="border-l-4 border-primary/60 pl-4">
                      <h4 className="font-semibold mb-1">Sydney Office</h4>
                      <p className="text-sm text-muted-foreground">
                        789 Tech Road<br />
                        Sydney, Australia<br />
                        <span className="text-primary">+61 2 0000 0000</span>
                      </p>
                    </div>
                    <div className="border-l-4 border-primary/60 pl-4">
                      <h4 className="font-semibold mb-1">Tokyo Office</h4>
                      <p className="text-sm text-muted-foreground">
                        101 Corporate Blvd<br />
                        Tokyo, Japan<br />
                        <span className="text-primary">+81 3 0000 0000</span>
                      </p>
                    </div>
                  </div>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.6976637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="SME CyberGuard Global Office Locations"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium">9:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium">Closed</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-muted-foreground">
                        <strong>Emergency Support:</strong> 24/7 via WhatsApp for Professional & Enterprise plans
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Quick answers to common questions about our cybersecurity services for SMEs
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="services">
                    <AccordionTrigger>What cybersecurity services do you offer for SMEs?</AccordionTrigger>
                    <AccordionContent>
                      We provide comprehensive cybersecurity solutions including real-time threat detection, endpoint protection, network security monitoring, employee cybersecurity training, compliance assistance for international data protection standards, incident response, and 24/7 security monitoring - all tailored specifically for small and medium enterprises worldwide.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cost">
                    <AccordionTrigger>How much do your services cost?</AccordionTrigger>
                    <AccordionContent>
                      We offer a free plan for basic protection, with paid plans starting at {formatPrice(23)}/month for up to 10 devices. Enterprise plans are customized based on your specific needs. Contact us for a free consultation and quote tailored to your business size and requirements.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="setup">
                    <AccordionTrigger>How long does it take to set up protection?</AccordionTrigger>
                    <AccordionContent>
                      Most SME setups are completed within 24-48 hours. We provide remote deployment and training to minimize disruption to your business operations. Our global support team ensures smooth implementation across all your locations.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="support">
                    <AccordionTrigger>What kind of support do you provide?</AccordionTrigger>
                    <AccordionContent>
                      We offer 24/7 technical support via phone, WhatsApp, and email. Professional and Enterprise customers get priority response within 4 hours, while all plans include dedicated account managers and regular security assessments.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="compliance">
                    <AccordionTrigger>Do you help with regulatory compliance?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we assist with compliance to international data protection standards, industry standards, and international regulations. Our compliance experts help SMEs navigate requirements for data protection, financial services, healthcare, and other regulated sectors.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data">
                    <AccordionTrigger>Is my data safe with your service?</AccordionTrigger>
                    <AccordionContent>
                      Absolutely. We use bank-grade encryption, comply with international data protection standards, and never access your business data without explicit permission. All our systems are hosted in secure data centers with redundant backups and disaster recovery plans.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call to Action */}
          <motion.div {...fadeIn} transition={{ delay: 0.5 }} className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center border">
            <h2 className="text-2xl font-bold mb-4">Ready to Secure Your Business?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join over 1,000 SMEs who trust us with their cybersecurity. Get started with a free consultation and see how we can protect your business today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="shadow-glow" onClick={() => document.getElementById('name')?.scrollIntoView({ behavior: 'smooth' })}>
                <Send className="h-4 w-4 mr-2" />
                Get Free Consultation
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="tel:+1555000000">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now: +1 555 000 000
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
