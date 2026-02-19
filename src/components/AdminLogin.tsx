"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield, Mail, Lock } from "lucide-react";
import { turso } from "@/lib/turso";

const AdminLogin = () => {
  const navigate = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Get admin from database
      const adminResult = await turso.execute({
        sql: "SELECT id, name, email, password_hash, business_name FROM admins WHERE email = ?",
        args: [email],
      });

      if (adminResult.rows.length === 0) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      const admin = adminResult.rows[0];

      // Verify password (simple verification for demo - in production use proper hashing)
      const passwordHash = btoa(password); // Base64 encoding for demo
      if (passwordHash !== admin.password_hash) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Create session
      const mockToken = `admin_session_${admin.id}_${Date.now()}`;
      sessionStorage.setItem("admin_token", mockToken);
      sessionStorage.setItem("admin_data", JSON.stringify({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        business_name: admin.business_name,
      }));

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err) {
      setError("Login failed. Please try again.");
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
          <h2 className="text-xl font-semibold text-white mb-2">Admin Login</h2>
          <p className="text-slate-400">Access the admin dashboard</p>
        </div>

        <Card className="shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your admin credentials to continue
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
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm">
                  Need to create an admin account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/admin/sme/register")}
                    className="text-primary hover:text-primary/80 font-medium underline"
                  >
                    Register here
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

export default AdminLogin;