import { signOutAction } from "@/server/actions/auth";
import { getCurrentUser } from "@/lib/permissions";
import { HeaderClient } from "@/components/layout/header-client";

export async function SiteHeader() {
  const { user, profile } = await getCurrentUser();

  return (
    <HeaderClient 
      isLoggedIn={Boolean(user)} 
      profileName={profile?.displayName ?? "Dashboard"} 
      role={profile?.role} 
      signOutAction={signOutAction} 
    />
  );
}
