import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client using the service role key.
 * Bypasses RLS — use only for privileged server-side operations
 * like creating a business row during signup.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Delete a user and their business record.
 * The service role key is required to delete auth users.
 * Cascade deletes handle leads and conversations.
 */
export async function adminDeleteUser(userId: string): Promise<void> {
  const supabase = createAdminClient();

  // Delete the business row first (cascade deletes leads + conversations)
  const { error: businessError } = await supabase
    .from("businesses")
    .delete()
    .eq("id", userId);

  if (businessError) {
    throw new Error(`Failed to delete business: ${businessError.message}`);
  }

  // Delete the auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    throw new Error(`Failed to delete auth user: ${authError.message}`);
  }
}
