"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Building, User, Phone, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuthState } from "@/lib/auth";
import { z } from "zod";

const onboardingSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
  ownerName: z.string().min(2, "Your name must be at least 2 characters").max(100),
  phone: z.string().min(10, "Please enter a valid phone number").max(20),
  industry: z.string().min(1, "Please select an industry"),
  heardAboutUs: z.string().min(1, "Please let us know how you heard about us"),
  businessSize: z.string().min(1, "Please select your business size"),
  primaryConcern: z.string().min(1, "Please select your primary security concern"),
});

const Onboarding = () => {
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [heardAboutUs, setHeardAboutUs] = useState("");
  const [businessSize, setBusinessSize] = useState("");
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authState = getAuthState();
    if (!authState.user) {
      router.push("/login");
      return;
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const validated = onboardingSchema.parse({
        businessName,
        ownerName,
        phone,
        industry,
        heardAboutUs,
        businessSize,
        primaryConcern,
      });

      const authState = getAuthState();
      if (!authState.user) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId: authState.user.business_id,
          userId: authState.user.id,
          ...validated,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Onboarding failed");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Onboarding failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <span className="text-3xl font-bold">SME CyberGuard</span>
          </div>
          <p className="text-lg text-muted-foreground">
            Complete your profile to get started
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Tell us about your business</CardTitle>
            <CardDescription>
              This helps us customize your security experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Business Information */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">Business Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      placeholder="Your Business Name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salon">Salon / Beauty</SelectItem>
                      <SelectItem value="wholesale">Wholesale / Distribution</SelectItem>
                      <SelectItem value="cybercafe">Cyber Café</SelectItem>
                      <SelectItem value="retail">Retail Shop</SelectItem>
                      <SelectItem value="restaurant">Restaurant / Hotel</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="hardware">Hardware Store</SelectItem>
                      <SelectItem value="accounting">Accounting / Bookkeeping</SelectItem>
                      <SelectItem value="technology">Technology / IT Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">Your Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Your Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ownerName"
                      placeholder="John Doe"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Onboarding Questions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quick Questions</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="heardAboutUs">How did you hear about us?</Label>
                  <Select value={heardAboutUs} onValueChange={setHeardAboutUs} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="search_engine">Search Engine (Google, etc.)</SelectItem>
                      <SelectItem value="referral">Referral from friend/colleague</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                      <SelectItem value="tech_blog">Technology Blog/Article</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessSize">Business Size</Label>
                  <Select value={businessSize} onValueChange={setBusinessSize} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1-10 employees)</SelectItem>
                      <SelectItem value="medium">Medium (11-50 employees)</SelectItem>
                      <SelectItem value="large">Large (50+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryConcern">Primary Security Concern</Label>
                  <Select value={primaryConcern} onValueChange={setPrimaryConcern} required>
                    <SelectTrigger>
                      <SelectValue placeholder="What matters most to you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="data_security">Data Security & Privacy</SelectItem>
                      <SelectItem value="malware_protection">Malware & Virus Protection</SelectItem>
                      <SelectItem value="compliance">Compliance & Regulations</SelectItem>
                      <SelectItem value="employee_monitoring">Employee Activity Monitoring</SelectItem>
                      <SelectItem value="ransomware">Ransomware Protection</SelectItem>
                      <SelectItem value="general_protection">General Business Protection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full shadow-glow" disabled={isLoading}>
                  {isLoading ? "Setting up your account..." : "Complete Setup"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;