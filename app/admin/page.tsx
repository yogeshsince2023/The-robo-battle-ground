import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

// Bare /admin has no content of its own — send admins to the dashboard if
// they already have a session, otherwise to the login page.
export default async function AdminIndexPage() {
  const admin = await getCurrentAdmin();
  redirect(admin ? "/admin/dashboard" : "/admin/login");
}
