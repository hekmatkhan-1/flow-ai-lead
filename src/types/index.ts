// ============================================================
// LeadFlow AI — Shared Type Definitions
// Matches the database schema in supabase/migrations/001_schema.sql
// ============================================================

export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "closed";
export type ConversationStatus = "active" | "closed" | "transferred";

// -----------------------------------------------------------
// Business (tenant)
// -----------------------------------------------------------
export interface Business {
  id: string;
  company_name: string;
  email: string;
  settings: BusinessSettings;
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  chatbot_name?: string;
  chatbot_greeting?: string;
  qualification_questions?: string[];
  brand_color?: string;
  logo_url?: string;
  business_hours?: string;
  contact_info?: string;
  contact_email?: string;
  welcome_message?: string;
}

// -----------------------------------------------------------
// Lead
// -----------------------------------------------------------
export interface Lead {
  id: string;
  business_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  industry: string | null;
  budget: string | null;
  timeline: string | null;
  requirements: string | null;
  lead_score: number;
  status: LeadStatus;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface LeadScore {
  score: number; // 0–100
  reasoning: string;
  factors: {
    interest: number;
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
}

// -----------------------------------------------------------
// Conversation
// -----------------------------------------------------------
export interface Conversation {
  id: string;
  lead_id: string | null;
  business_id: string;
  visitor_id: string;
  messages: ChatMessage[];
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
