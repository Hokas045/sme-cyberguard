"use client";
import Link from "next/link";
import {
  Crown,
  BarChart3,
  Building,
  CreditCard,
  Users,
  Settings,
  Shield,
  AlertTriangle,
  Activity,
  Database,
  UserCheck,
  Ban,
  Trash2,
  Star,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const AdminSidebar = () => {
  const location = useLocation();
  const { user, checkRole } = useAuth();

  const adminMenuItems = [
    {
      title: "Admin Dashboard",
      url: "/admin/stats",
      icon: Crown,
      description: "System overview & analytics"
    },
    {
      title: "Business Management",
      url: "/admin/businesses",
      icon: Building,
      description: "Manage all businesses"
    },
    {
      title: "Payment Overview",
      url: "/admin/payments",
      icon: CreditCard,
      description: "Payment transactions & revenue"
    },
    {
      title: "User Administration",
      url: "/admin/users",
      icon: Users,
      description: "Platform user management"
    },
  ];

  const systemMenuItems = [
    {
      title: "System Health",
      url: "/admin/health",
      icon: Activity,
      description: "Monitor system performance"
    },
    {
      title: "Audit Logs",
      url: "/admin/audit",
      icon: Database,
      description: "Security & compliance logs"
    },
    {
      title: "Threat Intelligence",
      url: "/admin/threats",
      icon: AlertTriangle,
      description: "Global threat monitoring"
    },
  ];

  const managementMenuItems = [
    {
      title: "Premium Upgrades",
      url: "/admin/upgrades",
      icon: Star,
      description: "Manage premium activations"
    },
    {
      title: "Suspensions",
      url: "/admin/suspensions",
      icon: Ban,
      description: "Suspended accounts"
    },
    {
      title: "System Settings",
      url: "/admin/settings",
      icon: Settings,
      description: "Platform configuration"
    },
  ];

  const menuGroups = [
    { label: "Administration", items: adminMenuItems },
    { label: "System Monitoring", items: systemMenuItems },
    { label: "Account Management", items: managementMenuItems },
  ];

  return (
    <SidebarUI className="border-r-2 border-primary/20">
      <SidebarHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="p-2 bg-primary rounded-lg">
            <Crown className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg text-primary">SuperAdmin</span>
            <p className="text-xs text-muted-foreground">Platform Control Center</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-primary font-semibold">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="group hover:bg-primary/10 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/70">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Admin Status Indicator */}
        <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">SuperAdmin Access</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Full platform control enabled
          </p>
        </div>
      </SidebarContent>
    </SidebarUI>
  );
};

export default AdminSidebar;
