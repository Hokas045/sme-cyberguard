"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNavigate, Outlet, useLocation };
import { useAuth } from "@/hooks/useAuth";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const DashboardLayout = () => {
  const { isAuthenticated, user, checkRole } = useAuth();
  const router = useRouter();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isSuperAdmin = checkRole('superadmin');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (isAdminRoute && !isSuperAdmin) {
      // Redirect non-superadmin users away from admin routes
      router.push("/dashboard");
    }
  }, [isAuthenticated, isSuperAdmin, isAdminRoute, navigate]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          {isAdminRoute && isSuperAdmin ? <AdminSidebar /> : <Sidebar />}
          <SidebarInset className="flex-1">
            <main className="flex-1 p-4 overflow-auto">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
