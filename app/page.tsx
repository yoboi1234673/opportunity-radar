"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Radar,
  User,
  Zap,
  Rocket,
  ArrowRight,
  GraduationCap,
  FlaskConical,
  Code2,
  Briefcase,
  Trophy,
  BookOpen,
  DollarSign,
  Globe,
  Menu,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "../src/components/ui/button";

const OPPORTUNITY_TYPES = [
  { label: "Scholarships", icon: GraduationCap, color: "bg-emerald-100 text-emerald-700" },
  { label: "Internships", icon: Briefcase, color: "bg-blue-100 text-blue-700" },
  { label: "Research Calls", icon: FlaskConical, color: "bg-teal-100 text-teal-700" },
  { label: "Hackathons", icon: Code2, color: "bg-purple-100 text-purple-700" },
  { label: "Remote Jobs", icon: Globe, color: "bg-indigo-100 text-indigo-700" },
  { label: "Grants", icon: DollarSign, color: "bg-amber-100 text-amber-700" },
  { label: "Open-source Bounties", icon: Trophy, color: "bg-orange-100 text-orange-700" },
  { label: "Fellowships", icon: BookOpen, color: "bg-pink-100 text-pink-700" },
];

const FOR_WHO = [
  {
    title: "Students",
    desc: "Undergrads and grad students looking for scholarships, research calls, and internships.",
    emoji: "🎓",
  },
  {
    title: "Researchers",
    desc: "Academics hunting for grants, fellowships, and open research positions worldwide.",
    emoji: "🔬",
  },
  {
    title: "Freelancers",
    desc: "Developers and creatives seeking hackathon prizes and open-source bounties.",
    emoji: "💻",
  },
  {
    title: "Job Seekers",
    desc: "Early-career professionals targeting remote roles with strong match scores.",
    emoji: "🌍",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: User,
    title: "Create your profile",
    desc: "Tell us your field, education level, country, and the types of opportunities you want.",
  },
  {
    step: "02",
    icon: Zap,
    title: "AI matches you daily",
    desc: "Our agents scan 10+ platforms every day and score each opportunity against your profile.",
  },
  {
    step: "03",
    icon: Rocket,
    title: "Apply with one click",
    desc: "Browse your personalized feed, save favourites, and apply directly from the card.",
  },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
            <Radar className="w-6 h-6 text-indigo-600" />
            <span>OpportunityRadar</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              How it works
            </a>
            <a href="#who" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              For who
            </a>
            <Link href="/auth">
              <Button size="sm">Get started</Button>
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 px-4 py-4 flex flex-col gap-4 bg-white dark:bg-gray-950">
            <a href="#how" className="text-sm text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>
              How it works
            </a>
            <a href="#who" className="text-sm text-gray-700 dark:text-gray-300" onClick={() => setMobileOpen(false)}>
              For who
            </a>
            <Link href="/auth" onClick={() => setMobileOpen(false)}>
              <Button className="w-full">Get started free</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6 text-center">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-indigo-100/60 dark:bg-indigo-900/20 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium mb-6">
            <CheckCircle className="w-3.5 h-3.5" />
            100% free to start — no credit card needed
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6">
            Stop missing opportunities
            <span className="text-indigo-600"> that were made for you</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI agents scan 10+ sources daily and deliver personalised scholarships, internships, research calls, and hackathons straight to your dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Get started free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                See how it works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10+", label: "Sources monitored" },
            { value: "Daily", label: "Updates" },
            { value: "100%", label: "Free to start" },
            { value: "Any field", label: "Works for" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-indigo-600">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-2">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Three steps to your next opportunity
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-5 right-5 text-4xl font-black text-gray-100 dark:text-gray-800 select-none">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section id="who" className="py-24 px-4 sm:px-6 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wide mb-2">For who</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Built for ambitious people everywhere
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FOR_WHO.map(({ title, desc, emoji }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunity types */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Every type of opportunity, in one place
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10">
            We track the categories that matter most to students and early-career professionals.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {OPPORTUNITY_TYPES.map(({ label, icon: Icon, color }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${color}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to find your opportunity?
          </h2>
          <p className="text-indigo-200 mb-8">
            Create your free profile in 2 minutes and start receiving personalised matches today.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="outline" className="bg-white text-indigo-700 border-white hover:bg-indigo-50 gap-2">
              Get started free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Radar className="w-4 h-4" />
            <span className="text-sm" suppressHydrationWarning>© {new Date().getFullYear()} OpportunityRadar. All rights reserved.</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
