import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ConversationDetail } from "./conversation-detail";
import type { Conversation, ChatMessage, Lead } from "@/types";

// ---------------------------------------------------------------------------
// Mock data — used when Supabase environment variables are not configured.
// ---------------------------------------------------------------------------

const MOCK_CONVERSATIONS: Record<string, Conversation & { lead?: Pick<Lead, "full_name" | "email" | "lead_score" | "id" | "status"> | null }> = {
  "660e8400-e29b-41d4-a716-446655440000": {
    id: "660e8400-e29b-41d4-a716-446655440000",
    lead_id: "550e8400-e29b-41d4-a716-446655440000",
    business_id: "mock-business-id",
    visitor_id: "visitor-001",
    messages: [
      { role: "user", content: "Hi, I'm looking for an AI chatbot for my support team.", timestamp: "2026-07-20T10:00:00Z" },
      { role: "assistant", content: "Great! What's your budget range for this project?", timestamp: "2026-07-20T10:00:05Z" },
      { role: "user", content: "$5K-$20K", timestamp: "2026-07-20T10:01:00Z" },
      { role: "assistant", content: "Perfect. And what's your timeline?", timestamp: "2026-07-20T10:01:05Z" },
      { role: "user", content: "1-3 months", timestamp: "2026-07-20T10:02:00Z" },
      { role: "assistant", content: "Thanks! That fits well within our typical implementation window. What industry are you in?", timestamp: "2026-07-20T10:02:05Z" },
      { role: "user", content: "SaaS — we run a customer support platform.", timestamp: "2026-07-20T10:03:00Z" },
      { role: "assistant", content: "Excellent! Our AI chatbot integrates seamlessly with most support platforms. I've noted your requirements — a sales rep will follow up shortly.", timestamp: "2026-07-20T10:03:10Z" },
    ],
    status: "active",
    created_at: "2026-07-20T10:00:00Z",
    updated_at: "2026-07-20T10:03:10Z",
    lead: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      full_name: "Alice Johnson",
      email: "alice@example.com",
      lead_score: 85,
      status: "qualified",
    },
  },
  "660e8400-e29b-41d4-a716-446655440001": {
    id: "660e8400-e29b-41d4-a716-446655440001",
    lead_id: "550e8400-e29b-41d4-a716-446655440001",
    business_id: "mock-business-id",
    visitor_id: "visitor-002",
    messages: [
      { role: "user", content: "I need an enterprise-grade lead qualification system.", timestamp: "2026-07-19T14:00:00Z" },
      { role: "assistant", content: "We can help with that. What industry are you in?", timestamp: "2026-07-19T14:00:05Z" },
      { role: "user", content: "FinTech", timestamp: "2026-07-19T14:01:00Z" },
      { role: "assistant", content: "Thanks! Our platform works great for FinTech companies. What's your budget?", timestamp: "2026-07-19T14:01:10Z" },
      { role: "user", content: "$20K+", timestamp: "2026-07-19T14:02:00Z" },
    ],
    status: "active",
    created_at: "2026-07-19T14:00:00Z",
    updated_at: "2026-07-19T14:02:00Z",
    lead: {
      id: "550e8400-e29b-41d4-a716-446655440001",
      full_name: "Bob Smith",
      email: "bob@example.com",
      lead_score: 92,
      status: "new",
    },
  },
  "660e8400-e29b-41d4-a716-446655440002": {
    id: "660e8400-e29b-41d4-a716-446655440002",
    lead_id: null,
    business_id: "mock-business-id",
    visitor_id: "visitor-003",
    messages: [
      { role: "user", content: "Just browsing... what do you offer?", timestamp: "2026-07-18T08:00:00Z" },
      { role: "assistant", content: "We offer AI-powered lead qualification chatbots. Want to learn more?", timestamp: "2026-07-18T08:00:05Z" },
    ],
    status: "closed",
    created_at: "2026-07-18T08:00:00Z",
    updated_at: "2026-07-18T09:00:00Z",
    lead: null,
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let conversation: (Conversation & { lead?: Pick<Lead, "full_name" | "email" | "lead_score" | "id" | "status"> | null }) | null = null;
  let fetchError = false;

  // Try Supabase first; fall back to mock data when env vars are missing
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("conversations")
          .select("*, lead:leads(id, full_name, email, lead_score, status)")
          .eq("id", id)
          .single();

        if (!error && data) {
          const row = data as Record<string, unknown>;
          conversation = {
            ...row,
            lead: Array.isArray(row.lead) ? (row.lead[0] ?? null) : (row.lead ?? null),
          } as Conversation & { lead?: Pick<Lead, "full_name" | "email" | "lead_score" | "id" | "status"> | null };
        }
      }
    } catch {
      fetchError = true;
    }
  } else {
    // Dev fallback — no Supabase configured
    conversation = MOCK_CONVERSATIONS[id] ?? null;
  }

  // -------------------------------------------------------------------------
  // Not-found state
  // -------------------------------------------------------------------------

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <MessageSquare className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Conversation not found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {fetchError
            ? "Something went wrong while loading this conversation. Please try again."
            : "The conversation you are looking for does not exist or you don't have access to it."}
        </p>
        <Link
          href="/dashboard/conversations"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Conversations
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------

  return <ConversationDetail conversation={conversation} />;
}
