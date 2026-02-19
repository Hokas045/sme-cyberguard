"use client";
import { motion } from "framer-motion";
import { Target, Heart, Shield, Eye, Award, CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";

const About = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      <main className="pt-24 pb-16 px-4 flex-1">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <motion.div {...fadeIn} className="text-center mb-20">
            <Badge variant="secondary" className="mb-4">About SME CyberGuard</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Protecting SMEs Worldwide
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              We're a startup focused on making cybersecurity simple and affordable for small and medium enterprises everywhere.
              Our mission is to protect businesses from cyber threats without the complexity and cost of enterprise solutions.
            </p>
          </motion.div>

          {/* Company Story */}
          <motion.section {...fadeIn} className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Born from a simple observation: SMEs worldwide deserve better cybersecurity.
              </p>
            </div>
            <Card className="gradient-hero text-primary-foreground">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold">The Problem We Saw</h3>
                    <p className="text-primary-foreground/90 leading-relaxed">
                      Every day, we hear stories of businesses worldwide losing money to cyber attacks. Small shops getting scammed through fake emails,
                      restaurants having their booking systems hacked, and manufacturers losing customer data. These aren't just technical problems—they're
                      threats to livelihoods and the global economy.
                    </p>
                    <p className="text-primary-foreground/90 leading-relaxed">
                      Big cybersecurity companies focus on large corporations with deep pockets. We saw that SMEs everywhere were left vulnerable,
                      using outdated antivirus or nothing at all. SME CyberGuard was created to bridge this gap with affordable, effective protection
                      designed specifically for small and medium businesses.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                      <Shield className="h-12 w-12 text-primary-foreground mb-4" />
                      <h4 className="text-xl font-semibold mb-2">Global SME Reality</h4>
                      <ul className="space-y-2 text-primary-foreground/80">
                        <li>• SMEs employ majority of global workforce</li>
                        <li>• Drive economic growth worldwide</li>
                        <li>• Face growing cyber threats</li>
                        <li>• Can't afford enterprise security</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Mission, Vision, Values */}
          <motion.section {...fadeIn} className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Foundation</h2>
              <p className="text-lg text-muted-foreground">What drives us every day</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
                <Card className="h-full">
                  <CardContent className="p-8 text-center">
                    <Target className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Mission</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      To provide simple, affordable cybersecurity for SMEs worldwide, ensuring businesses can thrive
                      in the digital economy without fear of cyber threats.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
                <Card className="h-full">
                  <CardContent className="p-8 text-center">
                    <Eye className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Vision</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      A world where every SME is cyber-secure, contributing to a stronger global digital economy that creates jobs
                      and drives innovation everywhere.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
                <Card className="h-full">
                  <CardContent className="p-8 text-center">
                    <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Values</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">SME First</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">Simple Solutions</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">Affordable Access</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">Community Focus</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.section>

          {/* What We're Building */}
          <motion.section {...fadeIn} className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What We're Building</h2>
              <p className="text-lg text-muted-foreground">Simple cybersecurity for SMEs worldwide</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Shield className="h-6 w-6 text-primary mr-2" />
                    Our Solution
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Lightweight Windows agent</li>
                    <li>• Real-time threat monitoring</li>
                    <li>• Simple dashboard for business owners</li>
                    <li>• Global support in multiple languages</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <Award className="h-6 w-6 text-primary mr-2" />
                    Our Commitment
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Affordable pricing for SMEs</li>
                    <li>• No complex setup required</li>
                    <li>• Secure cloud-based data storage</li>
                    <li>• Continuous improvement based on feedback</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section {...fadeIn} className="text-center">
            <Card className="gradient-hero text-primary-foreground">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Beta Program</h2>
                <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                  Be among the first businesses worldwide to try SME CyberGuard. Help us build the best protection
                  for SMEs while getting early access to our security platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    Join Beta Program
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                </div>
                <p className="text-sm text-primary-foreground/70 mt-4">
                  Free beta access • Help shape the product • Early adopter pricing
                </p>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
