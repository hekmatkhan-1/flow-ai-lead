import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import type { Business } from "@/types";

export const metadata = {
  title: "Settings — LeadFlow AI",
  description: "Manage your LeadFlow AI chatbot and account settings.",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch business record
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", user.id)
    .single<Business>();

  if (!business) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account, chatbot, and lead qualification preferences.
        </p>
      </div>

      <SettingsForm business={business} userEmail={user.email ?? "Unknown"} />
    </div>
  );
}
