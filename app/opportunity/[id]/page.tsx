"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Bookmark, ExternalLink, MapPin,
  Calendar, Tag, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../src/contexts/AuthContext";
import { ProtectedRoute } from "../../../src/components/ProtectedRoute";
import { getOpportunityWithMatch, updateMatchStatus } from "../../../src/lib/queries";
import { Button } from "../../../src/components/ui/button";
import { formatDeadline, TYPE_COLORS, getScoreColor } from "../../../src/lib/utils";
import type { MatchStatus } from "../../../src/types/database";

function OpportunityDetailContent({ id }: { id: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: match, isLoading, error, refetch } = useQuery({
    queryKey: ["match", id, user?.id],
    queryFn: () => getOpportunityWithMatch(id, user!.id),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: ({ status }: { status: MatchStatus }) =>
      updateMatchStatus(match!.id, status),
    onSuccess: (_data, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["match", id, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["matches", user?.id] });
      if (status === "saved") toast.success("Saved to bookmarks");
      if (status === "dismissed") { toast.info("Marked as not interested"); router.push("/dashboard"); }
      if (status === "applied") toast.success("Marked as applied!");
    },
    onError: () => toast.error("Failed to update status"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="font-semibold text-gray-700 dark:text-gray-300">Opportunity not found</h2>
        <p className="text-sm text-gray-500">This opportunity may not be in your matches.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          <Link href="/dashboard"><Button>Back to dashboard</Button></Link>
        </div>
      </div>
    );
  }

  const opp = match.opportunities;
  const deadline = formatDeadline(opp.deadline);
  const typeColor = TYPE_COLORS[opp.type] ?? "bg-gray-100 text-gray-600";
  const scoreColor = getScoreColor(match.score);

  const handleApply = () => {
    window.open(opp.url, "_blank", "noopener,noreferrer");
    updateMutation.mutate({ status: "applied" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Back bar */}
      <div className="sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${typeColor}`}>
            {opp.type}
          </span>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${scoreColor}`}>
            {match.score}% match
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-snug">
          {opp.title}
        </h1>

        {/* Key info */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Tag className="w-4 h-4" />
            <span>via <span className="font-medium text-gray-700 dark:text-gray-300">{opp.source}</span></span>
          </div>
          {opp.location && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{opp.location}</span>
            </div>
          )}
          {opp.deadline && (
            <div className={`flex items-center gap-1.5 ${deadline.color}`}>
              <Calendar className="w-4 h-4" />
              <span>{deadline.label}</span>
            </div>
          )}
        </div>

        {/* AI reason */}
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 mb-6">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1.5">
            Why this matched you
          </p>
          <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">{match.reason}</p>
        </div>

        {/* Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">Description</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{opp.description}</p>
        </div>

        {/* Tags */}
        {opp.tags?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {opp.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button onClick={handleApply} disabled={updateMutation.isPending} className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Apply now
          </Button>

          <Button
            variant="outline"
            onClick={() => updateMutation.mutate({ status: "saved" })}
            disabled={updateMutation.isPending || match.status === "saved"}
            className="gap-2"
          >
            <Bookmark className="w-4 h-4" fill={match.status === "saved" ? "currentColor" : "none"} />
            {match.status === "saved" ? "Saved" : "Save for later"}
          </Button>

          <Button
            variant="ghost"
            onClick={() => updateMutation.mutate({ status: "dismissed" })}
            disabled={updateMutation.isPending}
            className="text-gray-500 gap-2"
          >
            Not interested
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <OpportunityDetailContent id={id} />
    </ProtectedRoute>
  );
}
