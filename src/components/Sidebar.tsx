"use client";
import Link from "next/link";
import {
  BarChart3,
  Monitor,
  AlertTriangle,
  Shield,
  Globe,
  Usb,
  RefreshCw,
  Users,
  Settings,
  Crown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const Sidebar = () => {
  const location = useLocation();
  const { user, checkRole } = useAuth();

  const menuItems = [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: BarChart3,
    },
    {
      title: "Devices",
      url: "/dashboard/devices",
      icon: Monitor,
    },
    {
      title: "Threats",
      url: "/dashboard/threats",
      icon: AlertTriangle,
    },
    {
      title: "Quarantine",
      url: "/dashboard/quarantine",
      icon: Shield,
    },
    {
      title: "Web Activity",
      url: "/dashboard/web-activity",
      icon: Globe,
    },
    {
      title: "USB Activity",
      url: "/dashboard/usb-activity",
      icon: Usb,
    },
    {
      title: "Updates & Patches",
      url: "/dashboard/patches",
      icon: RefreshCw,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
      roles: ["admin", "owner"],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      roles: ["owner"],
    },
  ];

  const adminMenuItems = [
    {
      title: "Admin Dashboard",
      url: "/admin/stats",
      icon: Crown,
      roles: ["superadmin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => checkRole(role as any));
  });

  const filteredAdminMenuItems = adminMenuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => checkRole(role as any));
  });

  return (
    <SidebarUI>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold text-sidebar-foreground">SME CyberGuard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {filteredAdminMenuItems.length > 0 && (
                <>
                  <div className="mx-2 my-4 border-t border-sidebar-border" />
                  {filteredAdminMenuItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarUI>
  );
};

export default Sidebar;
