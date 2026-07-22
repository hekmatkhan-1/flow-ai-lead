import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageSquare, Search, Filter, Clock, User } from "lucide-react";
import Link from "next/link";
import type { Conversation, ChatMessage, ConversationStatus, Lead } from "@/types";

// ---------------------------------------------------------------------------
// Mock data — used when Supabase environment variables are not configured.
// ---------------------------------------------------------------------------

const MOCK_CONVERSATIONS: (Conversation & { lead?: Pick<Lead, "full_name" | "email" | "lead_score"> | null })[] = [
  {
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
    ],
    status: "active",
    created_at: "2026-07-20T10:00:00Z",
    updated_at: "2026-07-20T10:02:00Z",
    lead: { full_name: "Alice Johnson", email: "alice@example.com", lead_score: 85 },
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    lead_id: "550e8400-e29b-41d4-a716-446655440001",
    business_id: "mock-business-id",
    visitor_id: "visitor-002",
    messages: [
      { role: "user", content: "I need an enterprise-grade lead qualification system.", timestamp: "2026-07-19T14:00:00Z" },
      { role: "assistant", content: "We can help with that. What industry are you in?", timestamp: "2026-07-19T14:00:05Z" },
      { role: "user", content: "FinTech", timestamp: "2026-07-19T14:01:00Z" },
      { role: "assistant", content: "Thanks! Our platform works great for FinTech companies.", timestamp: "2026-07-19T14:01:10Z" },
    ],
    status: "active",
    created_at: "2026-07-19T14:00:00Z",
    updated_at: "2026-07-19T14:01:10Z",
    lead: { full_name: "Bob Smith", email: "bob@example.com", lead_score: 92 },
  },
  {
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
  {
    id: "660e8400-e29b-41d4-a716-446655440003",
    lead_id: "550e8400-e29b-41d4-a716-446655440002",
    business_id: "mock-business-id",
    visitor_id: "visitor-004",
    messages: [
      { role: "user", content: "Can you connect me with a sales rep?", timestamp: "2026-07-17T12:00:00Z" },
      { role: "assistant", content: "Absolutely! Let me transfer you.", timestamp: "2026-07-17T12:00:05Z" },
    ],
    status: "transferred",
    created_at: "2026-07-17T12:00:00Z",
    updated_at: "2026-07-17T12:30:00Z",
    lead: { full_name: "Carol Davis", email: "carol@example.com", lead_score: 35 },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getLastMessage(messages: ChatMessage[]): ChatMessage | null {
  if (!messages || messages.length === 0) return null;
  return messages[messages.length - 1];
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusBadgeVariant(status: ConversationStatus): "default" | "new" | "qualified" | "closed" {
  switch (status) {
    case "active":
      return "new"; // blue
    case "closed":
      return "closed"; // gray
    case "transferred":
      return "qualified"; // amber
    default:
      return "default";
  }
}

// ---------------------------------------------------------------------------
// Search / filter wrapper (delegates filtering to a client sub-component
// to keep this a server component while allowing interactive inputs)
// ---------------------------------------------------------------------------

interface ConversationsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>;
}

export default async function ConversationsPage({ searchParams }: ConversationsPageProps) {
  const sp = await searchParams;
  const searchQuery = sp.search ?? "";
  const statusFilter = sp.status as ConversationStatus | undefined;

  let conversations: (Conversation & { lead?: Pick<Lead, "full_name" | "email" | "lead_score"> | null })[] = [];
  let fetchError = false;

  // Try Supabase first; fall back to mock data
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        let query = supabase
          .from("conversations")
          .select("*, lead:leads(full_name, email, lead_score)")
          .order("updated_at", { ascending: false });

        if (statusFilter) {
          query = query.eq("status", statusFilter);
        }

        const { data, error } = await query;

        if (!error && data) {
          conversations = data.map((row: Record<string, unknown>) => ({
            ...row,
            lead: Array.isArray(row.lead) ? (row.lead[0] ?? null) : (row.lead ?? null),
          })) as typeof conversations;
        }
      }
    } catch {
      fetchError = true;
    }
  } else {
    // Dev fallback — use mock data
    let filtered = [...MOCK_CONVERSATIONS];

    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.lead?.full_name?.toLowerCase().includes(q) ||
          c.lead?.email?.toLowerCase().includes(q) ||
          c.visitor_id?.toLowerCase().includes(q)
      );
    }

    conversations = filtered;
  }

  // Client-side search on already-fetched results (for the mock/fallback path)
  // For the Supabase path, we'll do client-side filtering too since the API
  // already returned everything.

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Conversations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review chat histories from your leads and visitors.
        </p>
      </div>

      {/* Filters bar — uses a client form that reloads with searchParams */}
      <form className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search by lead name or email..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:placeholder:text-gray-500"
          />
        </div>
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="transferred">Transferred</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </form>

      {/* Error banner */}
      {fetchError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Something went wrong loading conversations. Showing available data.
        </div>
      )}

      {/* List */}
      {conversations.length === 0 ? (
        /* ---- Empty state ---- */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No conversations yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              {searchQuery || statusFilter
                ? "No conversations match your filters. Try adjusting your search."
                : "When visitors interact with your chatbot, their conversations will appear here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* ---- Conversation list ---- */
        <div className="space-y-2">
          {conversations.map((conv) => {
            const lastMsg = getLastMessage(conv.messages);
            const leadName = conv.lead?.full_name ?? `Visitor ${conv.visitor_id.slice(0, 8)}`;
            const leadEmail = conv.lead?.email;

            return (
              <Link
                key={conv.id}
                href={`/dashboard/conversations/${conv.id}`}
                className="block"
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-shadow hover:shadow-md",
                    "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <CardContent className="flex items-center gap-4 px-4 py-4 sm:px-6">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                      {leadName.charAt(0).toUpperCase()}
                    </div>

                    {/* Main info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {leadName}
                        </span>
                        {conv.lead?.lead_score !== undefined && (
                          <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500">
                            Score: {conv.lead.lead_score}
                          </span>
                        )}
                      </div>
                      {leadEmail && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {leadEmail}
                        </p>
                      )}
                      <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                        {lastMsg ? (
                          <>
                            <span className="font-medium">
                              {lastMsg.role === "user" ? "Visitor" : "Bot"}:
                            </span>{" "}
                            {lastMsg.content}
                          </>
                        ) : (
                          <span className="italic text-gray-400">No messages</span>
                        )}
                      </p>
                    </div>

                    {/* Right column: status, count, date */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={statusBadgeVariant(conv.status)}>
                        {conv.status.charAt(0).toUpperCase() + conv.status.slice(1)}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <MessageSquare className="h-3 w-3" />
                        {conv.messages.length}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate(conv.updated_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
