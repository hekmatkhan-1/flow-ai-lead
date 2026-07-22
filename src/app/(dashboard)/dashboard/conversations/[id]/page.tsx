import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageCircle,
  User,
  Bot,
  ExternalLink,
  Archive,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ChatMessage, Lead } from "@/types";

// ---------------------------------------------------------------------------
// Server Action — close the conversation
// ---------------------------------------------------------------------------
async function closeConversationAction(formData: FormData) {
  "use server";

  const conversationId = formData.get("conversationId") as string;
  if (!conversationId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("conversations")
    .update({ status: "closed" })
    .eq("id", conversationId)
    .eq("business_id", user.id);

  revalidatePath(`/dashboard/conversations/${conversationId}`);
}

// ---------------------------------------------------------------------------
// Helpers (pure — safe in server component)
// ---------------------------------------------------------------------------

/** Format an ISO timestamp string to a relative phrase like "2 minutes ago". */
function relativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

/** Tailwind badge for conversation status. */
function statusBadge(status: string) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  switch (status) {
    case "active":
      return (
        <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}>
          Active
        </span>
      );
    case "closed":
      return (
        <span className={`${base} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
          Closed
        </span>
      );
    case "transferred":
      return (
        <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>
          Transferred
        </span>
      );
    default:
      return <span className={base}>{status}</span>;
  }
}

/** Colour-coded lead score pill. */
function leadScoreBadge(score: number) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  if (score >= 80) {
    return (
      <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`}>
        🔥 {score}
      </span>
    );
  }
  if (score >= 50) {
    return (
      <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`}>
        ⭐ {score}
      </span>
    );
  }
  return (
    <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}>
      {score}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page — Server Component
// ---------------------------------------------------------------------------

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the conversation (RLS enforces business_id = auth.uid())
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  // ---- Not-found state ----
  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <MessageCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Conversation not found
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          This conversation does not exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/dashboard/conversations"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to conversations
        </Link>
      </div>
    );
  }

  // Fetch linked lead (if any)
  let lead: Lead | null = null;
  if (conversation.lead_id) {
    const { data: leadData } = await supabase
      .from("leads")
      .select("*")
      .eq("id", conversation.lead_id)
      .single();
    lead = leadData as Lead | null;
  }

  const messages: ChatMessage[] = Array.isArray(conversation.messages)
    ? conversation.messages
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ---- Back link ---- */}
      <Link
        href="/dashboard/conversations"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Conversations
      </Link>

      {/* ---- Header Card ---- */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
              <MessageCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Conversation
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {conversation.visitor_id
                  ? `Visitor ${conversation.visitor_id.slice(0, 8)}…`
                  : "Anonymous visitor"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge(conversation.status)}
            {lead && leadScoreBadge(lead.lead_score)}
          </div>
        </CardHeader>

        {/* Lead info banner */}
        {lead && (
          <CardContent>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lead</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {lead.full_name || "Unnamed lead"}
                  </p>
                </div>
                {lead.email && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {lead.email}
                    </p>
                  </div>
                )}
                {lead.company && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {lead.company}
                    </p>
                  </div>
                )}
                <div className="ml-auto">
                  <Link href={`/dashboard/leads/${lead.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      View Lead
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        )}

        {/* Actions footer */}
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </p>
          <div className="flex gap-2">
            {lead && (
              <Link href={`/dashboard/leads/${lead.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View Lead
                </Button>
              </Link>
            )}
            {conversation.status === "active" && (
              <form action={closeConversationAction}>
                <input type="hidden" name="conversationId" value={conversation.id} />
                <Button type="submit" variant="ghost" size="sm">
                  <Archive className="mr-1.5 h-3.5 w-3.5" />
                  Close Conversation
                </Button>
              </form>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* ---- Chat Messages ---- */}
      <Card>
        <CardContent className="px-6 py-0">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No messages yet.
              </p>
            </div>
          ) : (
            <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto py-4" id="chat-scroll-container">
              {messages.map((msg, i) => {
                const isVisitor = msg.role === "user";
                return (
                  <div
                    key={i}
                    className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[80%] gap-2 ${
                        isVisitor ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isVisitor
                            ? "bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {isVisitor ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div>
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isVisitor
                              ? "rounded-tr-md bg-primary-600 text-white"
                              : "rounded-tl-md bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p
                          className={`mt-1 text-xs text-gray-400 dark:text-gray-500 ${
                            isVisitor ? "text-right" : "text-left"
                          }`}
                        >
                          {msg.timestamp ? relativeTime(msg.timestamp) : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Anchor for auto-scroll */}
              <div id="chat-bottom" />
            </div>
          )}

          {/* Auto-scroll to bottom on load via vanilla JS */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var el = document.getElementById("chat-bottom");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                })();
              `,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
