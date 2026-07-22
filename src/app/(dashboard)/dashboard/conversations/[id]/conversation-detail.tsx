"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Bot,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRightLeft,
  ExternalLink,
  MessageSquare,
  Mail,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { Badge, scoreToBadgeVariant, scoreLabel } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { Conversation, ChatMessage, Lead, ConversationStatus } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_ICON: Record<ConversationStatus, React.ReactNode> = {
  active: <CheckCircle className="h-4 w-4 text-green-500" />,
  closed: <XCircle className="h-4 w-4 text-gray-400" />,
  transferred: <ArrowRightLeft className="h-4 w-4 text-amber-500" />,
};

const STATUS_LABEL: Record<ConversationStatus, string> = {
  active: "Active",
  closed: "Closed",
  transferred: "Transferred",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ConversationDetailProps {
  conversation: Conversation & {
    lead?: Pick<Lead, "full_name" | "email" | "lead_score" | "id" | "status"> | null;
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConversationDetail({ conversation }: ConversationDetailProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Local state for optimistic status updates
  const [status, setStatus] = useState<ConversationStatus>(conversation.status);
  const [updating, setUpdating] = useState(false);

  const lead = conversation.lead;

  // -------------------------------------------------------------------------
  // Auto-scroll to bottom on mount and when messages change
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation.messages]);

  // -------------------------------------------------------------------------
  // Status change
  // -------------------------------------------------------------------------

  const handleStatusChange = useCallback(
    async (newStatus: ConversationStatus) => {
      if (newStatus === status) return;
      setUpdating(true);

      const prevStatus = status;
      setStatus(newStatus); // optimistic

      try {
        const res = await fetch(`/api/conversations/${conversation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error ?? "Failed to update status");
          setStatus(prevStatus); // rollback
          return;
        }

        toast.success(`Conversation marked as ${STATUS_LABEL[newStatus].toLowerCase()}`);
        router.refresh();
      } catch {
        toast.error("Failed to update status");
        setStatus(prevStatus);
      } finally {
        setUpdating(false);
      }
    },
    [conversation.id, status, router]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/dashboard/conversations")}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Conversations
      </button>

      {/* ---- Header card ---- */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
          {/* Left: lead info */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {(lead?.full_name ?? `Visitor ${conversation.visitor_id.slice(0, 6)}`).charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {lead?.full_name ?? `Visitor ${conversation.visitor_id.slice(0, 8)}`}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                {lead?.email && (
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    {lead.email}
                  </span>
                )}
                {lead?.lead_score !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    <Badge variant={scoreToBadgeVariant(lead.lead_score)}>
                      {scoreLabel(lead.lead_score)} · {lead.lead_score}/100
                    </Badge>
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  {STATUS_ICON[status]}
                  <span className="font-medium">{STATUS_LABEL[status]}</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Started {formatFullDate(conversation.created_at)}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status actions */}
            {status !== "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("active")}
                isLoading={updating}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Reopen
              </Button>
            )}
            {status !== "closed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("closed")}
                isLoading={updating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Close
              </Button>
            )}
            {status !== "transferred" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange("transferred")}
                isLoading={updating}
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transfer
              </Button>
            )}

            {/* View lead link */}
            {lead?.id && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Lead
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ---- Chat messages ---- */}
      <Card className="overflow-hidden">
        {/* Messages area */}
        <div
          ref={scrollRef}
          className="max-h-[60vh] overflow-y-auto bg-gray-50 px-4 py-6 dark:bg-gray-900/50 sm:px-6"
        >
          {conversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No messages in this conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.messages.map((msg, index) => {
                const isVisitor = msg.role === "user";
                const isBot = msg.role === "assistant";
                const isSystem = msg.role === "system";

                if (isSystem) {
                  return (
                    <div key={index} className="flex justify-center">
                      <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      isVisitor ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        isVisitor
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      )}
                    >
                      {isVisitor ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                        isVisitor
                          ? "bg-primary-600 text-white rounded-tr-md"
                          : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-tl-md border border-gray-200 dark:border-gray-700"
                      )}
                    >
                      {/* Role label */}
                      <p
                        className={cn(
                          "mb-0.5 text-xs font-semibold",
                          isVisitor
                            ? "text-primary-100"
                            : "text-gray-400 dark:text-gray-500"
                        )}
                      >
                        {isVisitor ? (lead?.full_name ?? "Visitor") : "LeadFlow AI"}
                      </p>

                      {/* Content */}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content}
                      </p>

                      {/* Timestamp */}
                      <p
                        className={cn(
                          "mt-1 text-right text-xs",
                          isVisitor
                            ? "text-primary-200"
                            : "text-gray-400 dark:text-gray-500"
                        )}
                      >
                        <Clock className="mr-1 inline h-3 w-3" />
                        {formatTimestamp(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer bar — conversation meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-6 py-3 dark:border-gray-700">
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>
              {conversation.messages.length} message{conversation.messages.length !== 1 ? "s" : ""}
            </span>
            <span>·</span>
            <span>Visitor ID: {conversation.visitor_id.slice(0, 12)}...</span>
            <span>·</span>
            <span>Created {formatFullDate(conversation.created_at)}</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Conversation ID: {conversation.id.slice(0, 8)}...
          </p>
        </div>
      </Card>
    </div>
  );
}
