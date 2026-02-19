"use client";

import { Shield, CheckCircle, AlertTriangle, Users, TrendingUp, Zap, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";

const Landing = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
              <span className="text-white font-semibold text-lg">Global SME Cybersecurity Platform</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">
              Enterprise-Grade Security<br />
              <span className="bg-gradient-to-r from-yellow-300 via-red-400 to-green-400 bg-clip-text text-transparent">
                For Small Businesses
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
              Cyber threats are a global epidemic, affecting businesses everywhere. Join 500+ SMEs who've secured their future with SME CyberGuard.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-white/25 text-xl px-10 py-4 font-bold transform hover:scale-105 transition-all duration-300"
              >
                🛡️ Start Protecting Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/how-it-works")}
                className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-xl px-10 py-4 font-semibold backdrop-blur-sm"
              >
                See How It Works
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-4xl font-black text-white mb-2">40%</div>
                <div className="text-white/80 font-medium">of global GDP from SMEs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-4xl font-black text-white mb-2">60%</div>
                <div className="text-white/80 font-medium">of SMEs face cyber threats</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="text-4xl font-black text-white mb-2">80%</div>
                <div className="text-white/80 font-medium">of jobs at risk</div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-white/60">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm">14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 px-4 bg-destructive/5">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-8 w-8" />
              <h2 className="text-3xl font-bold">The Problem</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Most SMEs have <strong>zero protection</strong>. No antivirus. No monitoring. No idea if someone's stealing their data until it's too late. They're running Windows PCs with outdated software, employees clicking suspicious links, and bank accounts one phishing email away from being emptied.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Traditional cybersecurity? It's built for corporations with IT teams. It's expensive. It's complicated. It assumes you know what "network segmentation" means. <strong>SMEs get left behind.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Solution CTA */}
      <section className="py-12 px-4 bg-gradient-to-r from-destructive/10 via-warning/10 to-primary/10">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-card rounded-3xl p-8 shadow-xl border border-border">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Stop Being a Sitting Duck?</h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of SMEs who've already secured their businesses. Don't wait for the next ransomware attack.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold"
              >
                Start My Free 14-Day Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/contact")}
                className="border-primary text-primary hover:bg-primary/10 px-8 py-3"
              >
                Talk to an Expert
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No setup fees • Cancel anytime • 24/7 support</p>
          </div>
        </div>
      </section>

      {/* Solution: The 3-Part System */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Complete Protection System</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The SME CyberGuard Solution</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A comprehensive 3-part system designed for SMEs worldwide—no IT expertise required, just enterprise-grade protection that actually works.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-card to-card/50 hover:from-primary/5 hover:to-primary/10 transform hover:-translate-y-2">
              <CardContent className="p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:bg-primary/10 transition-colors duration-500"></div>
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">PART 1</div>
                  <h3 className="text-2xl font-bold mb-4">The Windows Agent</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Your invisible digital bodyguard. A lightweight program installed on every computer that monitors everything without slowing you down.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">24/7 process monitoring & threat detection</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Network connection surveillance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Software inventory & vulnerability scanning</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full hover:shadow-2xl transition-all duration-500 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transform hover:-translate-y-2 relative">
              <CardContent className="p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 group-hover:bg-primary/20 transition-colors duration-500"></div>
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">PART 2</div>
                  <h3 className="text-2xl font-bold mb-4">The AI Brain</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Advanced AI that transforms raw data into actionable insights. Continuously learns your business patterns and flags anomalies.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Machine learning-powered threat analysis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Dynamic risk scoring (0-100 scale)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Behavioral pattern recognition</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-card to-card/50 hover:from-primary/5 hover:to-primary/10 transform hover:-translate-y-2">
              <CardContent className="p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:bg-primary/10 transition-colors duration-500"></div>
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-sm font-semibold text-primary mb-2">PART 3</div>
                  <h3 className="text-2xl font-bold mb-4">The Dashboard</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Your command center in plain English. No tech jargon—just clear alerts, one-click fixes, and peace of mind.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Real-time threat visualization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Automated remediation actions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Mobile-optimized interface</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-4 bg-card rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">Q</div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">+</div>
              </div>
              <span className="text-muted-foreground font-medium">Works seamlessly with QuickBooks, WhatsApp Business, Google Workspace & more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Trusted by Businesses Worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what SME owners worldwide are saying about their cybersecurity transformation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary mb-4 opacity-50" />
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "We were hit by ransomware last year and lost everything. SME CyberGuard not only protected us but helped us recover our data. Now we sleep peacefully knowing our business is secure."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">AM</span>
                </div>
                <div>
                  <div className="font-semibold">Amelia Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Fashion Boutique, Madrid</div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary mb-4 opacity-50" />
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "As a tech novice, I was overwhelmed by cybersecurity. SME CyberGuard's dashboard is so simple—even my grandmother could use it! We've caught 3 phishing attempts already."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">JO</span>
                </div>
                <div>
                  <div className="font-semibold">Joseph Chen</div>
                  <div className="text-sm text-muted-foreground">Hardware Store, Toronto</div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary mb-4 opacity-50" />
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "The phishing simulation training was eye-opening. My team went from clicking suspicious links to reporting them immediately. Worth every penny!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">SA</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Thompson</div>
                  <div className="text-sm text-muted-foreground">Accounting Firm, Sydney</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Businesses Protected</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Threat Detection Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Monitoring Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <Shield className="h-6 w-6 text-white" />
              <span className="font-semibold">Cybersecurity Leaders Trust SME CyberGuard</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Secure Your Business's<br />
              <span className="bg-gradient-to-r from-yellow-300 via-red-400 to-green-400 bg-clip-text text-transparent">
                Future Today
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Don't let cyber criminals disrupt your hard-earned success. Join 500+ SMEs who've made the smart choice for enterprise-grade protection.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="bg-white text-primary hover:bg-white/90 shadow-2xl text-xl px-12 py-4 font-bold transform hover:scale-105 transition-all duration-300"
              >
                🛡️ Start Free Protection Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/demo")}
                className="border-2 border-white/30 text-white hover:bg-white/10 text-xl px-12 py-4 backdrop-blur-sm"
              >
                Book a Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">$0</div>
                <div className="text-white/80 text-sm">Setup Cost</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">15 Min</div>
                <div className="text-white/80 text-sm">Setup Time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">24/7</div>
                <div className="text-white/80 text-sm">Protection</div>
              </div>
            </div>

            <p className="text-white/60 text-sm mt-8">
              Trusted by businesses worldwide
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
