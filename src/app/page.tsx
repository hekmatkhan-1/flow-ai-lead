import Link from "next/link";
import {
  Bot,
  TrendingUp,
  LayoutDashboard,
  Zap,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Star,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Landing page — LeadFlow AI
// ---------------------------------------------------------------------------

const features = [
  {
    icon: Bot,
    title: "AI Chatbot",
    description:
      "Engage website visitors 24/7 with a smart chatbot that holds natural conversations, handles objections, and qualifies leads while you sleep.",
    gradient: "from-blue-500 to-cyan-500",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Lead Scoring",
    description:
      "Every lead gets an intelligent score based on budget, timeline, authority, and need. Focus your energy on the hottest opportunities first.",
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: LayoutDashboard,
    title: "CRM Dashboard",
    description:
      "All your qualified leads flow into a clean, searchable CRM. Filter, sort, export, and manage every lead from one beautiful dashboard.",
    gradient: "from-green-500 to-emerald-500",
    bgLight: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
];

const socialProof = [
  { metric: "50K+", label: "Leads Qualified" },
  { metric: "98%", label: "Uptime" },
  { metric: "24/7", label: "Engagement" },
  { metric: "4.9", label: "User Rating" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-sm shadow-blue-500/25">
              LF
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              LeadFlow AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-600"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/10 blur-3xl dark:from-blue-600/10 dark:to-cyan-600/5" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/10 blur-3xl dark:from-amber-600/10 dark:to-orange-600/5" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <Zap className="h-4 w-4" />
              AI-Powered Lead Qualification
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
              Turn Every Website
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Visitor into a Qualified Lead
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              LeadFlow AI gives you an intelligent chatbot that engages visitors
              24/7, qualifies them through natural conversation, scores every
              lead, and funnels everything into a clean CRM dashboard — all from
              a single embed script.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
              >
                See it in action
              </Link>
            </div>

            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">
              No credit card required · Free 50 leads/month
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Social proof ---------- */}
      <section className="border-y border-gray-200 bg-white py-10 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {socialProof.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {item.metric}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="bg-gray-50 py-24 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              How it works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Three simple steps to start converting visitors into qualified
              leads.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Install the snippet",
                description:
                  "Add a single line of JavaScript to your website. The chatbot widget appears instantly — no custom code required.",
              },
              {
                step: "2",
                title: "AI qualifies visitors",
                description:
                  "Our AI engages every visitor in natural conversation, asking the right questions at the right time to qualify them.",
              },
              {
                step: "3",
                title: "Close more deals",
                description:
                  "Hot leads land in your CRM with full profiles and scores. Follow up with the right people at the right time.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xl font-bold text-white shadow-lg shadow-blue-500/25">
                  {item.step}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Everything you need to qualify leads
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Powerful features that work together to turn anonymous visitors
              into actionable leads.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Gradient accent top border */}
                  <div
                    className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  />
                  <div
                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgLight}`}
                  >
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>

                  {/* Hover shine */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Trust ---------- */}
      <section className="bg-gray-50 py-24 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
              Built for B2B teams
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              LeadFlow AI is purpose-built for agencies, SaaS companies, and
              professional service firms that need to convert website traffic
              into qualified leads — without staffing live chat around the
              clock.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Bot,
                  title: "Always-on",
                  description:
                    "Engages visitors nights and weekends when your team is offline.",
                },
                {
                  icon: BarChart3,
                  title: "Smart scoring",
                  description:
                    "AI analyzes every conversation to surface your hottest leads first.",
                },
                {
                  icon: Star,
                  title: "Easy setup",
                  description:
                    "One embed script. Five minutes. Start qualifying leads today.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <item.icon className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 px-8 py-16 text-center shadow-2xl sm:px-16">
            {/* Glow effects */}
            <div className="pointer-events-none absolute -inset-1">
              <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to capture more leads?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
                Join hundreds of B2B teams using LeadFlow AI to qualify leads
                automatically. Start free — no credit card required.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-8 py-3.5 text-base font-semibold text-gray-900 shadow-lg transition-all hover:from-blue-400 hover:to-cyan-300 sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-600 px-8 py-3.5 text-base font-semibold text-gray-200 transition-all hover:border-gray-500 hover:bg-white/5 sm:w-auto"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="bg-gray-900 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              &copy; 2026 LeadFlow AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Link
                href="/legal/privacy"
                className="transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/legal/terms"
                className="transition-colors hover:text-white"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
