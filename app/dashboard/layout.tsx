import type { ReactNode } from "react"
import { StoreSettingsProvider } from "@/lib/store-settings-context"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { SubscriptionStatusBanner } from "@/components/dashboard/subscription-status-banner"
import { Toaster } from "@/components/ui/sonner"
import { DashboardAuthGuard } from "@/components/dashboard/dashboard-auth-guard"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAuthGuard>
      <StoreSettingsProvider>
        <div className="flex min-h-svh flex-col">
          <SubscriptionStatusBanner />
          <div className="flex flex-1 flex-col lg:flex-row">
            <DashboardNav />
            <main className="flex-1 overflow-x-hidden">{children}</main>
          </div>
        </div>
        <Toaster position="top-center" theme="dark" />
      </StoreSettingsProvider>
    </DashboardAuthGuard>
  )
}
