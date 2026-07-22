"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { updateSettingsAction, deleteAccountAction } from "./actions";
import type { Business, BusinessSettings } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface SettingsFormProps {
  business: Business;
  userEmail: string;
}

// ---------------------------------------------------------------------------
// Helper: field-level input with label
// ---------------------------------------------------------------------------
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SettingsForm — main component
// ---------------------------------------------------------------------------
export function SettingsForm({ business, userEmail }: SettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for all fields, initialised from DB values
  const [companyName, setCompanyName] = useState(business.company_name);
  const [chatbotName, setChatbotName] = useState(
    business.settings.chatbot_name ?? ""
  );
  const [welcomeMessage, setWelcomeMessage] = useState(
    business.settings.welcome_message ?? ""
  );
  const [brandColor, setBrandColor] = useState(
    business.settings.brand_color ?? "#2563eb"
  );
  const [logoUrl, setLogoUrl] = useState(
    business.settings.logo_url ?? ""
  );
  const [businessHours, setBusinessHours] = useState(
    business.settings.business_hours ?? ""
  );
  const [contactEmail, setContactEmail] = useState(
    business.settings.contact_email ?? ""
  );
  const [questions, setQuestions] = useState<string[]>(
    business.settings.qualification_questions ?? [
      "What's your biggest challenge right now?",
      "What's your budget range?",
      "What's your timeline for a solution?",
    ]
  );

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ------------------------------------------------------------------
  // Qualification questions CRUD
  // ------------------------------------------------------------------
  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, ""]);
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateQuestion = useCallback((index: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  // ------------------------------------------------------------------
  // Save handler
  // ------------------------------------------------------------------
  const handleSave = useCallback(() => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("company_name", companyName);
      formData.append("chatbot_name", chatbotName);
      formData.append("welcome_message", welcomeMessage);
      formData.append("brand_color", brandColor);
      formData.append("logo_url", logoUrl);
      formData.append("business_hours", businessHours);
      formData.append("contact_email", contactEmail);
      // Filter out empty questions, send as JSON
      formData.append(
        "qualification_questions",
        JSON.stringify(questions.filter((q) => q.trim() !== ""))
      );

      const result = await updateSettingsAction(formData);

      if (result.success) {
        toast.success("Settings saved successfully");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to save settings");
      }
    });
  }, [
    companyName,
    chatbotName,
    welcomeMessage,
    brandColor,
    logoUrl,
    businessHours,
    contactEmail,
    questions,
    router,
  ]);

  // ------------------------------------------------------------------
  // Delete account handler
  // ------------------------------------------------------------------
  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccountAction();
      if (result.success) {
        toast.success("Account deleted");
        router.push("/login");
      } else {
        toast.error(result.error ?? "Failed to delete account");
      }
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  }, [router]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ── Company Profile ── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Company Profile
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your business information.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Company Name">
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Inc."
            />
          </Field>
          <Field label="Email">
            <Input
              id="email"
              value={userEmail}
              disabled
              className="cursor-not-allowed opacity-60"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Your email is managed via your authentication provider and cannot
              be changed here.
            </p>
          </Field>
        </CardContent>
      </Card>

      {/* ── Chatbot Customization ── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chatbot Customization
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Personalize how your chatbot appears and greets visitors.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Chatbot Name">
            <Input
              id="chatbot_name"
              value={chatbotName}
              onChange={(e) => setChatbotName(e.target.value)}
              placeholder="LeadBot"
            />
          </Field>

          <Field label="Welcome Message">
            <textarea
              id="welcome_message"
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={3}
              placeholder="Hi there! How can I help you today?"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-50 dark:placeholder:text-gray-500 dark:focus:border-primary-400"
            />
          </Field>

          {/* Brand color */}
          <Field label="Brand Color">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  id="brand_color"
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 bg-transparent p-0.5 dark:border-gray-600"
                  aria-label="Brand color picker"
                />
              </div>
              <Input
                id="brand_color_hex"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                placeholder="#2563eb"
                className="max-w-[10rem] font-mono"
              />
              {/* Preview circle */}
              <div
                className="h-8 w-8 shrink-0 rounded-full border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: brandColor }}
                aria-hidden="true"
              />
            </div>
          </Field>

          <Field label="Logo URL">
            <Input
              id="logo_url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Optional. Provide a URL to your company logo.
            </p>
          </Field>
        </CardContent>
      </Card>

      {/* ── Qualification Settings ── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Qualification Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure how the chatbot qualifies your leads.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Editable questions list */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Qualification Questions
            </label>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Questions the chatbot will ask to qualify leads. Empty entries are
              removed on save.
            </p>

            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="shrink-0 text-xs font-medium text-gray-400 dark:text-gray-500 w-6 text-right">
                    {i + 1}.
                  </span>
                  <Input
                    value={q}
                    onChange={(e) => updateQuestion(i, e.target.value)}
                    placeholder="e.g. What's your budget range?"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(i)}
                    aria-label={`Remove question ${i + 1}`}
                    className="shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestion}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Question
            </Button>
          </div>

          <Field label="Business Hours">
            <Input
              id="business_hours"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="Mon-Fri 9am-5pm EST"
            />
          </Field>

          <Field label="Contact Email for Lead Notifications">
            <Input
              id="contact_email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="leads@acme.com"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              We&apos;ll send lead notifications to this address.
            </p>
          </Field>
        </CardContent>
      </Card>

      {/* ── Danger Zone ── */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Irreversible and destructive actions.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Delete Account
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permanently delete your account and all lead data. This action
                cannot be undone.
              </p>
            </div>
            <Button
              type="button"
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Save ── */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          isLoading={isPending}
          size="lg"
        >
          Save Changes
        </Button>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
        description="Are you sure you want to permanently delete your account? All your leads, conversations, and settings will be permanently removed. This action cannot be undone."
        confirmLabel={isDeleting ? "Deleting..." : "Delete Account"}
        cancelLabel="Cancel"
        onConfirm={handleDeleteAccount}
        variant="danger"
      />
    </div>
  );
}
