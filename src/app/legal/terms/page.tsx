/**
 * Terms of Service page for LeadFlow AI.
 * Route: /legal/terms
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — LeadFlow AI",
  description: "LeadFlow AI terms of service — acceptable use, disclaimers, and liability.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Last updated: July 22, 2026
      </p>

      <h2>Acceptance of Terms</h2>
      <p>
        By accessing or using the LeadFlow AI chatbot widget, website, dashboard,
        or any related services (collectively, the &ldquo;Service&rdquo;), you
        agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you
        do not agree to these Terms, you may not use the Service. These Terms
        apply to all visitors, users, and businesses who access or use the
        Service.
      </p>

      <h2>Description of Service</h2>
      <p>
        LeadFlow AI provides an AI-powered chatbot that engages website visitors,
        qualifies leads through natural conversation, scores each lead, and
        delivers lead profiles into a CRM dashboard. The Service is offered on a
        freemium subscription basis as described on our website.
      </p>

      <h2>Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use the chatbot to send spam, unsolicited messages, or bulk commercial
          communications.
        </li>
        <li>
          Attempt to reverse engineer, decompile, or extract the source code of
          the Service or any AI model powering it.
        </li>
        <li>
          Use the Service to collect, store, or process sensitive personal data
          (such as health information, financial account credentials, or
          government ID numbers) without our prior written consent.
        </li>
        <li>
          Interfere with or disrupt the Service, its servers, or networks.
        </li>
        <li>
          Use the Service in any way that violates applicable laws or
          regulations.
        </li>
        <li>
          Abuse or exploit the chatbot through automated scripts, excessive
          requests, or attempts to degrade service quality for other users.
        </li>
        <li>
          Impersonate any person or entity, or falsely state or misrepresent your
          affiliation with a person or entity.
        </li>
      </ul>

      <h2>User Accounts</h2>
      <p>
        When you create an account with us, you must provide accurate, complete,
        and current information. You are responsible for safeguarding your
        account credentials and for all activities under your account. You must
        notify us immediately of any unauthorized use of your account.
      </p>

      <h2>Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality
        (including but not limited to software, code, algorithms, AI models,
        designs, text, and graphics) are and will remain the exclusive property
        of LeadFlow AI and its licensors. These Terms do not grant you any right,
        title, or interest in the Service except the limited right to use it as
        described herein.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        <strong>
          The service is provided on an &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo; basis.
        </strong>{" "}
        LeadFlow AI makes no representations or warranties of any kind, express
        or implied, regarding the operation or availability of the Service, or
        the accuracy, reliability, or completeness of any information or content
        provided. To the fullest extent permitted by law, we disclaim all
        warranties, including implied warranties of merchantability, fitness for
        a particular purpose, and non-infringement.
      </p>
      <p>
        We do not guarantee that the Service will be uninterrupted, secure, or
        error-free, or that any defects will be corrected. AI-generated content
        may occasionally be inaccurate or inappropriate — you use the Service at
        your own discretion.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, in no event shall
        LeadFlow AI, its officers, directors, employees, or agents be liable for
        any indirect, incidental, special, consequential, or punitive damages,
        including without limitation loss of profits, data, use, goodwill, or
        other intangible losses, resulting from:
      </p>
      <ul>
        <li>Your use or inability to use the Service.</li>
        <li>
          Any conduct or content of any third party on the Service.
        </li>
        <li>
          Unauthorized access, use, or alteration of your transmissions or
          content.
        </li>
      </ul>
      <p>
        Our total liability for any claim arising out of or relating to these
        Terms or the Service shall not exceed the amount you have paid us in the
        twelve (12) months preceding the claim, or one hundred dollars ($100) if
        you have not made any payments.
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless LeadFlow AI and its
        affiliates from and against any claims, damages, costs, liabilities, and
        expenses (including reasonable attorneys&rsquo; fees) arising out of or
        related to your use of the Service or your violation of these Terms.
      </p>

      <h2>Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the
        laws of the State of Delaware, United States of America, without regard
        to its conflict of law provisions. Any legal action or proceeding arising
        under these Terms shall be brought exclusively in the federal or state
        courts located in Delaware, and you consent to the personal jurisdiction
        of such courts.
      </p>

      <h2>Changes to Terms</h2>
      <p>
        We reserve the right to modify or replace these Terms at any time. If a
        revision is material, we will make reasonable efforts to provide notice
        (such as through the Service or via email). By continuing to access or
        use the Service after those revisions become effective, you agree to be
        bound by the revised Terms. If you do not agree to the new Terms, you
        must stop using the Service.
      </p>

      <h2>Termination</h2>
      <p>
        We may terminate or suspend your account and access to the Service
        immediately, without prior notice or liability, for any reason, including
        without limitation if you breach these Terms. Upon termination, your
        right to use the Service will immediately cease.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about these Terms, please contact us at{" "}
        <a href="mailto:support@leadflow.ai">support@leadflow.ai</a>.
      </p>
    </>
  );
}
