"use client";
import { Shield, Bell, User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { query } from "@/lib/turso";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [businessName, setBusinessName] = useState<string>("");
  const [threatCount, setThreatCount] = useState<number>(0);

  useEffect(() => {
    const fetchBusinessName = async () => {
      if (user?.business_id) {
        try {
          const businesses = await query(
            "SELECT name FROM businesses WHERE id = ?",
            [user.business_id]
          );
          if (businesses.length > 0) {
            setBusinessName(businesses[0].name as string);
          }
        } catch (error) {
          console.error("Failed to fetch business name:", error);
        }
      }
    };

    const fetchThreatCount = async () => {
      if (user?.business_id) {
        try {
          const threats = await query(
            "SELECT COUNT(*) as count FROM threat_alerts WHERE business_id = ? AND status = 'open'",
            [user.business_id]
          );
          setThreatCount(threats[0].count as number);
        } catch (error) {
          console.error("Failed to fetch threat count:", error);
        }
      }
    };

    fetchBusinessName();
    fetchThreatCount();
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side: Sidebar Trigger, Logo and Business Name */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Shield className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="font-bold text-xl">SME CyberGuard</span>
          </Link>
          {businessName && (
            <span className="text-muted-foreground hidden md:inline">• {businessName}</span>
          )}
        </div>

        {/* Right Side: Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {threatCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {threatCount > 9 ? "9+" : threatCount}
              </Badge>
            )}
          </Button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.email}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {businessName}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
