/**
 * Privacy Policy page for LeadFlow AI.
 * Route: /legal/privacy
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — LeadFlow AI",
  description: "LeadFlow AI privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Last updated: July 22, 2026
      </p>

      <p>
        LeadFlow AI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;)
        is committed to protecting your privacy. This Privacy Policy explains how
        we collect, use, disclose, and safeguard your information when you
        interact with our AI-powered chatbot widget embedded on our
        customers&rsquo; websites.
      </p>

      <h2>Information We Collect</h2>
      <p>
        When you interact with a LeadFlow AI chatbot, you may voluntarily provide
        the following types of information through natural conversation:
      </p>
      <ul>
        <li>
          <strong>Personal identifiers:</strong> name, email address, and phone
          number.
        </li>
        <li>
          <strong>Professional information:</strong> company name, industry, and
          job title.
        </li>
        <li>
          <strong>Project details:</strong> budget range, timeline, and specific
          requirements you describe.
        </li>
        <li>
          <strong>Conversation data:</strong> the full transcript of your chat
          with the AI chatbot.
        </li>
        <li>
          <strong>Technical data:</strong> a randomly generated visitor ID stored
          in your browser&rsquo;s localStorage to maintain conversation context.
        </li>
      </ul>
      <p>
        All information is provided voluntarily — you choose what to share during
        the conversation.
      </p>

      <h2>How We Use Your Information</h2>
      <p>We use the information we collect for the following purposes:</p>
      <ul>
        <li>
          <strong>Lead qualification:</strong> to analyze your responses and
          determine fit, interest level, and priority for the business whose
          website you are visiting.
        </li>
        <li>
          <strong>CRM storage:</strong> to create a lead profile and store it in
          the CRM dashboard of the business you are chatting with, enabling them
          to follow up with you.
        </li>
        <li>
          <strong>Service improvement:</strong> to improve our AI models and
          chatbot performance through aggregated, anonymized analysis.
        </li>
        <li>
          <strong>Support:</strong> to respond to your inquiries or data requests
          submitted to our support team.
        </li>
      </ul>

      <h2>Data Security</h2>
      <p>
        We take data security seriously. Our platform uses the following
        safeguards:
      </p>
      <ul>
        <li>
          <strong>Row Level Security (RLS):</strong> our database
          (Supabase/PostgreSQL) enforces strict row-level security policies,
          ensuring each business can only access its own leads and data.
        </li>
        <li>
          <strong>Encryption at rest:</strong> all data stored in our database is
          encrypted at rest using industry-standard AES-256 encryption.
        </li>
        <li>
          <strong>Encryption in transit:</strong> all communication between your
          browser, our servers, and third-party services is encrypted using
          TLS 1.3.
        </li>
        <li>
          <strong>Access controls:</strong> only authenticated business users
          with proper credentials can access lead data through the dashboard.
        </li>
      </ul>

      <h2>Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the following rights:</p>
      <ul>
        <li>
          <strong>Right to access:</strong> you can request a copy of the data we
          hold about you.
        </li>
        <li>
          <strong>Right to deletion:</strong> you can request that we delete your
          personal data from our systems.
        </li>
        <li>
          <strong>Right to rectification:</strong> you can request correction of
          inaccurate data.
        </li>
        <li>
          <strong>Right to object:</strong> you can object to the processing of
          your data.
        </li>
      </ul>
      <p>
        To exercise any of these rights, you can either contact the business
        whose chatbot you interacted with directly, or email our support team at{" "}
        <a href="mailto:support@leadflow.ai">support@leadflow.ai</a>. We will
        respond to your request within 30 days.
      </p>

      <h2>Cookies &amp; Local Storage</h2>
      <p>
        We use browser localStorage (not cookies) for the following
        functionality:
      </p>
      <ul>
        <li>
          <strong>Visitor ID:</strong> a randomly generated string stored as{" "}
          <code>lf_visitor_id</code> that allows the chatbot to maintain
          conversation continuity across page loads.
        </li>
        <li>
          <strong>Cached settings:</strong> widget display settings stored as{" "}
          <code>leadflow_settings</code> to reduce server requests and improve
          load times.
        </li>
      </ul>
      <p>
        We do not use localStorage for tracking, advertising, or profiling. You
        can clear this data at any time through your browser settings.
      </p>

      <h2>Third Parties</h2>
      <p>
        We do <strong>not</strong> sell, rent, or share your personal data with
        third parties for their own marketing purposes. The data you provide
        through the chatbot is shared only with the specific business whose
        website you are visiting, for the purpose of lead follow-up. We may use
        third-party service providers (such as OpenAI for AI processing) solely
        to operate our service — these providers are bound by data processing
        agreements and confidentiality obligations.
      </p>

      <h2>Children&rsquo;s Privacy</h2>
      <p>
        Our service is not intended for individuals under the age of 16. We do
        not knowingly collect personal information from children. If you believe
        a child has provided us with personal data, please contact us immediately.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        revise the &ldquo;Last updated&rdquo; date at the top of this page. We
        encourage you to review this policy periodically to stay informed about
        how we protect your data.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or our data practices,
        please contact us at{" "}
        <a href="mailto:support@leadflow.ai">support@leadflow.ai</a>.
      </p>
    </>
  );
}
