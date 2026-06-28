"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Radar, Bell, Bookmark, X, ExternalLink, Search,
  Inbox, ChevronRight, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../src/contexts/AuthContext";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";
import { getUserMatches, getMatchStats, updateMatchStatus } from "../../src/lib/queries";
import { Button } from "../../src/components/ui/button";
import { formatDeadline, TYPE_COLORS, getScoreColor, cn } from "../../src/lib/utils";
import type { UserMatchWithOpportunity, MatchStatus } from "../../src/types/database";

const TYPE_FILTERS = ["All", "Scholarship", "Internship", "Research", "Hackathon", "Job", "Grant", "Bounty"];
const SORT_OPTIONS = ["Newest", "Highest match", "Deadline soonest"];

// ─── Sample data (shown when 0 matches) ─────────────────────────────────────
const SAMPLES: UserMatchWithOpportunity[] = [
  {
    id: "s1", user_id: "", opportunity_id: "s1", score: 92, status: "new",
    reason: "Matches your AI/ML interests and undergraduate level.",
    notified_at: null, created_at: new Date().toISOString(),
    opportunities: {
      id: "s1", title: "[Sample] Google Summer of Code 2025",
      description: "Open source internship programme by Google.",
      url: "#", source: "google", type: "internship",
      deadline: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      location: "Remote", tags: ["open-source", "coding", "stipend"], scraped_at: new Date().toISOString(),
    },
  },
  {
    id: "s2", user_id: "", opportunity_id: "s2", score: 87, status: "new",
    reason: "Aligns with your Computer Science background and hackathon preference.",
    notified_at: null, created_at: new Date(Date.now() - 86400000).toISOString(),
    opportunities: {
      id: "s2", title: "[Sample] MIT Solve Hackathon — Climate Action",
      description: "Global hackathon for innovative climate solutions.",
      url: "#", source: "devpost", type: "hackathon",
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      location: "Remote / Boston", tags: ["climate", "innovation", "prize"], scraped_at: new Date().toISOString(),
    },
  },
  {
    id: "s3", user_id: "", opportunity_id: "s3", score: 78, status: "new",
    reason: "Research call matching your Physics and Mathematics interests.",
    notified_at: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    opportunities: {
      id: "s3", title: "[Sample] CERN Summer Student Programme",
      description: "8-week research internship at CERN for physics students.",
      url: "#", source: "arxiv", type: "research",
      deadline: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
      location: "Geneva, Switzerland", tags: ["physics", "research", "CERN"], scraped_at: new Date().toISOString(),
    },
  },
  {
    id: "s4", user_id: "", opportunity_id: "s4", score: 95, status: "new",
    reason: "Top scholarship match for your education level and region.",
    notified_at: null, created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    opportunities: {
      id: "s4", title: "[Sample] Gates Cambridge Scholarship 2025",
      description: "Full funding for postgraduate study at University of Cambridge.",
      url: "#", source: "kaggle", type: "scholarship",
      deadline: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
      location: "Cambridge, UK", tags: ["scholarship", "cambridge", "full-funding"], scraped_at: new Date().toISOString(),
    },
  },
  {
    id: "s5", user_id: "", opportunity_id: "s5", score: 70, status: "new",
    reason: "Remote engineering role aligned with your job search preferences.",
    notified_at: null, created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    opportunities: {
      id: "s5", title: "[Sample] Junior ML Engineer — Hugging Face (Remote)",
      description: "Entry-level ML position at Hugging Face.",
      url: "#", source: "linkedin", type: "job",
      deadline: null, location: "Remote", tags: ["ML", "Python", "NLP"], scraped_at: new Date().toISOString(),
    },
  },
  {
    id: "s6", user_id: "", opportunity_id: "s6", score: 82, status: "new",
    reason: "Grant for your research area with matching eligibility criteria.",
    notified_at: null, created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    opportunities: {
      id: "s6", title: "[Sample] NSF Graduate Research Fellowship",
      description: "US National Science Foundation fellowship for graduate students.",
      url: "#", source: "arxiv", type: "grant",
      deadline: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      location: "USA", tags: ["NSF", "fellowship", "research"], scraped_at: new Date().toISOString(),
    },
  },
];

// ─── Card skeleton ────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-20 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full ml-auto" />
      </div>
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="flex gap-1">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Opportunity card ─────────────────────────────────────────────────────────
function OpportunityCard({
  match,
  onAction,
}: {
  match: UserMatchWithOpportunity;
  onAction: (id: string, status: MatchStatus) => void;
}) {
  const opp = match.opportunities;
  const deadline = formatDeadline(opp.deadline);
  const typeColor = TYPE_COLORS[opp.type] ?? "bg-gray-100 text-gray-600";
  const scoreColor = getScoreColor(match.score);

  return (
    <div className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-all animate-fade-in">
      {/* Top row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${typeColor}`}>
          {opp.type}
        </span>
        <span className={`ml-auto inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${scoreColor}`}>
          {match.score}% match
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2">
        {opp.title}
      </h3>

      {/* Source */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">via {opp.source}</p>

      {/* AI reason */}
      <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed mb-3 line-clamp-1">
        {match.reason}
      </p>

      {/* Tags */}
      {opp.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {opp.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs mb-4">
        <span className={deadline.color}>{deadline.label}</span>
        {opp.location && (
          <span className="text-gray-400 dark:text-gray-500 truncate">{opp.location}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          title="Save"
          onClick={() => onAction(match.id, "saved")}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            match.status === "saved"
              ? "border-indigo-300 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400"
              : "border-gray-200 dark:border-gray-700 text-gray-400 hover:text-indigo-600 hover:border-indigo-300"
          )}
        >
          <Bookmark className="w-4 h-4" fill={match.status === "saved" ? "currentColor" : "none"} />
        </button>

        <button
          title="Dismiss"
          onClick={() => onAction(match.id, "dismissed")}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <Link href={`/opportunity/${opp.id}`} className="ml-auto">
          <Button size="sm" variant="ghost" className="gap-1 text-xs">
            View <ChevronRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [typeFilter, setTypeFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [search, setSearch] = useState("");
  const [showDismissed, setShowDismissed] = useState(false);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", user?.id],
    queryFn: () => getUserMatches(user!.id),
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats", user?.id],
    queryFn: () => getMatchStats(user!.id),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ matchId, status }: { matchId: string; status: MatchStatus }) =>
      updateMatchStatus(matchId, status),
    onMutate: async ({ matchId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["matches", user?.id] });
      const prev = queryClient.getQueryData<UserMatchWithOpportunity[]>(["matches", user?.id]);
      queryClient.setQueryData<UserMatchWithOpportunity[]>(["matches", user?.id], (old = []) =>
        old.map((m) => (m.id === matchId ? { ...m, status } : m))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["matches", user?.id], ctx.prev);
      toast.error("Failed to update");
    },
    onSuccess: (_data, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["stats", user?.id] });
      if (status === "saved") toast.success("Saved to bookmarks");
      if (status === "dismissed") toast.info("Dismissed");
    },
  });

  const handleAction = (matchId: string, status: MatchStatus) => {
    updateMutation.mutate({ matchId, status });
  };

  const displayMatches = matches.length > 0 ? matches : SAMPLES;
  const isSample = matches.length === 0 && !isLoading;

  const filtered = useMemo(() => {
    let list = displayMatches.filter((m) => {
      if (!showDismissed && m.status === "dismissed") return false;
      if (typeFilter !== "All" && m.opportunities.type !== typeFilter.toLowerCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          m.opportunities.title.toLowerCase().includes(q) ||
          m.opportunities.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    if (sort === "Newest") {
      list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === "Highest match") {
      list = [...list].sort((a, b) => b.score - a.score);
    } else if (sort === "Deadline soonest") {
      list = [...list].sort((a, b) => {
        const da = a.opportunities.deadline ? new Date(a.opportunities.deadline).getTime() : Infinity;
        const db = b.opportunities.deadline ? new Date(b.opportunities.deadline).getTime() : Infinity;
        return da - db;
      });
    }

    return list;
  }, [displayMatches, typeFilter, sort, search, showDismissed]);

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "there";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <Radar className="w-5 h-5 text-indigo-600" />
            <span className="hidden sm:inline">OpportunityRadar</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <Bell className="w-4 h-4" />
            </button>
            <Link href="/profile">
              <Button variant="ghost" size="sm">Profile</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Sample notice */}
        {isSample && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
            <strong>Sample opportunities shown</strong> — your personalised matches will appear here once our AI agents scan your profile. Check back soon!
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "New today", value: stats?.newToday ?? 0 },
            { label: "Saved", value: stats?.saved ?? 0 },
            { label: "Applied", value: stats?.applied ?? 0 },
            { label: "Total found", value: stats?.total ?? (isSample ? 6 : 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-5 py-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-6 space-y-3">
          {/* Type pills */}
          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sort + Search */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Show dismissed toggle */}
          <button
            onClick={() => setShowDismissed(!showDismissed)}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {showDismissed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showDismissed ? "Hide dismissed" : "Show dismissed"}
          </button>
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center gap-4 text-center">
            <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-700" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">No opportunities found</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your filters or check back tomorrow for new matches.
            </p>
            <Button variant="outline" size="sm" onClick={() => { setTypeFilter("All"); setSearch(""); }}>
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((match) => (
              <OpportunityCard
                key={match.id}
                match={match}
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
