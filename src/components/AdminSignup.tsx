"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield, User, Mail, Lock, Building } from "lucide-react";
import { turso } from "@/lib/turso";
import { z } from "zod";

const adminSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
});

const AdminSignup = () => {
  const navigate = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const validated = adminSignupSchema.parse({
        name,
        email,
        password,
        businessName,
      });

      // Check if admin already exists
      const existingAdmin = await turso.execute({
        sql: "SELECT id FROM admins WHERE email = ?",
        args: [validated.email],
      });

      if (existingAdmin.rows.length > 0) {
        setError("Admin account already exists with this email");
        setIsLoading(false);
        return;
      }

      // Hash password (simple hash for demo - in production use proper hashing)
      const passwordHash = btoa(validated.password); // Base64 encoding for demo

      // Create admin account
      const adminId = crypto.randomUUID();
      await turso.execute({
        sql: "INSERT INTO admins (id, name, email, password_hash, business_name, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
        args: [adminId, validated.name, validated.email, passwordHash, validated.businessName],
      });

      // Auto-login admin
      const mockToken = `admin_session_${adminId}_${Date.now()}`;
      sessionStorage.setItem("admin_token", mockToken);
      sessionStorage.setItem("admin_data", JSON.stringify({
        id: adminId,
        name: validated.name,
        email: validated.email,
        business_name: validated.businessName,
      }));

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SME CyberGuard</h1>
              <p className="text-slate-400 text-sm">Admin Portal</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Admin Registration</h2>
          <p className="text-slate-400">Create your admin account to manage the platform</p>
        </div>

        <Card className="shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Create Admin Account</CardTitle>
            <CardDescription className="text-slate-400">
              Register as an administrator for SME CyberGuard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-800 bg-red-900/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-slate-200">Business/Organization Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="businessName"
                    placeholder="Your Organization"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@organization.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400">Minimum 8 characters</p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Admin Account"}
              </Button>

              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm">
                  Already have an admin account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/admin/login")}
                    className="text-primary hover:text-primary/80 font-medium underline"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-slate-300 text-sm underline"
          >
            ← Back to main site
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSignup;