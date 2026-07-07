import { redirect } from "next/navigation";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { getCurrentUser } from "@/lib/session";

export default async function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/login");
  }

  const isCoordinator = currentUser.role === "coordinator";

  return (
    <SidebarProvider>
      <AppSidebar isCoordinator={isCoordinator} />
      <SidebarInset>
        <AppHeader userName={currentUser.name} />
        <div className="flex min-h-0 flex-1 flex-col pb-14 md:pb-0">{children}</div>
      </SidebarInset>
      <MobileBottomNav isCoordinator={isCoordinator} />
    </SidebarProvider>
  );
}
