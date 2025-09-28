import CustomerDashboard from "@/components/pages/CustomerDashboardSimple"

export const metadata = {
  title: "Dashboard | Nandighosh Bus Service",
  description: "Manage your bookings, profile, and account settings. View your booking history and travel details.",
  keywords: "customer dashboard, booking history, profile management, Nandighosh bus service"
}

export default function DashboardPage() {
  return <CustomerDashboard />
}
