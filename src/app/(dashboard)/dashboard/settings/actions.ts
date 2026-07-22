"use server";

import { createClient } from "@/lib/supabase/server";
import { adminDeleteUser } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { BusinessSettings } from "@/types";

/**
 * Update the current business's settings and company name.
 * Validates auth and updates both the company_name column and
 * the settings JSONB column on the businesses table.
 */
export async function updateSettingsAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const companyName = formData.get("company_name") as string;
  const chatbotName = formData.get("chatbot_name") as string;
  const welcomeMessage = formData.get("welcome_message") as string;
  const brandColor = formData.get("brand_color") as string;
  const logoUrl = formData.get("logo_url") as string | null;
  const businessHours = formData.get("business_hours") as string;
  const contactEmail = formData.get("contact_email") as string;

  // Parse qualification questions from JSON string sent by the form
  let qualificationQuestions: string[] = [];
  const questionsRaw = formData.get("qualification_questions") as string;
  if (questionsRaw) {
    try {
      qualificationQuestions = JSON.parse(questionsRaw);
      if (!Array.isArray(qualificationQuestions)) {
        qualificationQuestions = [];
      }
    } catch {
      qualificationQuestions = [];
    }
  }

  const settings: BusinessSettings = {
    chatbot_name: chatbotName || undefined,
    welcome_message: welcomeMessage || undefined,
    brand_color: brandColor || undefined,
    logo_url: logoUrl || undefined,
    business_hours: businessHours || undefined,
    contact_email: contactEmail || undefined,
    qualification_questions:
      qualificationQuestions.length > 0 ? qualificationQuestions : undefined,
  };

  const { error } = await supabase
    .from("businesses")
    .update({
      company_name: companyName,
      settings,
    })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

/**
 * Permanently delete the current user's account, business record,
 * and all associated data (leads, conversations — via cascade).
 */
export async function deleteAccountAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await adminDeleteUser(user.id);
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete account";
    return { success: false, error: message };
  }
}
