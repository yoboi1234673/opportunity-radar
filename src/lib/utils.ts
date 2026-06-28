import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(deadline: string | null): {
  label: string;
  color: string;
} {
  if (!deadline) return { label: "No deadline", color: "text-gray-400" };

  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Expired", color: "text-gray-400 line-through" };
  if (diffDays === 0) return { label: "Due today!", color: "text-red-600 font-semibold" };
  if (diffDays <= 7) return { label: `${diffDays}d left`, color: "text-red-500" };
  if (diffDays <= 30) return { label: `${diffDays}d left`, color: "text-amber-500" };

  return {
    label: due.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    color: "text-gray-500",
  };
}

export const TYPE_COLORS: Record<string, string> = {
  scholarship: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  hackathon: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  internship: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  research: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  job: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  grant: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  bounty: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  fellowship: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export function getScoreColor(score: number): string {
  if (score >= 80) return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
  if (score >= 60) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
}
