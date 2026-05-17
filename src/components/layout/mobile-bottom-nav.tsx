import { getCurrentUser } from "@/lib/permissions";
import { MobileBottomNavClient } from "@/components/layout/mobile-bottom-nav-client";

export async function MobileBottomNav() {
  const { user, profile } = await getCurrentUser();

  return (
    <MobileBottomNavClient 
      isLoggedIn={Boolean(user)} 
      role={profile?.role} 
    />
  );
}
