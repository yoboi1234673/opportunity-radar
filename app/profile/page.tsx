"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Trash2, Loader2, AlertTriangle, Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../src/contexts/AuthContext";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";
import { getProfile, upsertProfile, deleteProfile } from "../../src/lib/queries";
import { Button } from "../../src/components/ui/button";
import type { EducationLevel } from "../../src/types/database";

const FIELDS = [
  "AI/ML", "Computer Science", "Data Science", "Robotics", "Biotechnology",
  "Physics", "Mathematics", "Economics", "Design", "Business",
  "Cybersecurity", "Environmental Science", "Medicine", "Law", "Other",
];

const OPPORTUNITY_TYPES = [
  "Scholarships", "Internships", "Research calls", "Hackathons",
  "Remote jobs", "Grants", "Open-source bounties", "Fellowships",
];

const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: "high_school", label: "High School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "masters", label: "Masters" },
  { value: "phd", label: "PhD" },
  { value: "working_professional", label: "Working Professional" },
];

const toggleItem = (arr: string[], item: string) =>
  arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

function ProfileContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    educationLevel: "" as EducationLevel | "",
    country: "",
    targetCountry: "Anywhere",
    cgpa: "",
    fieldsOfInterest: [] as string[],
    opportunityTypes: [] as string[],
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name ?? "",
        educationLevel: profile.education_level ?? "",
        country: profile.country ?? "",
        targetCountry: profile.target_country ?? "Anywhere",
        cgpa: profile.cgpa?.toString() ?? "",
        fieldsOfInterest: profile.field_of_interest ?? [],
        opportunityTypes: (profile.opportunity_types ?? []).map((t) =>
          t.charAt(0).toUpperCase() + t.replace(/_/g, " ").slice(1)
        ),
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await upsertProfile({
        id: user.id,
        full_name: form.fullName,
        education_level: form.educationLevel as EducationLevel,
        country: form.country,
        target_country: form.targetCountry,
        cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
        field_of_interest: form.fieldsOfInterest,
        opportunity_types: form.opportunityTypes.map((t) => t.toLowerCase().replace(/ /g, "_")),
      });
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profile saved!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || deleteConfirm !== "DELETE") return;
    try {
      await deleteProfile(user.id);
      await signOut();
      toast.success("Account deleted");
      router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Back bar */}
      <div className="sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save changes
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your details to improve your daily matches.</p>
        </div>

        {/* Personal info */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Personal information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
            <input
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Education level</label>
            <select
              value={form.educationLevel}
              onChange={(e) => setForm((f) => ({ ...f, educationLevel: e.target.value as EducationLevel }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select…</option>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Nigeria"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target country</label>
              <input
                type="text"
                value={form.targetCountry}
                onChange={(e) => setForm((f) => ({ ...f, targetCountry: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Anywhere"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              CGPA <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={form.cgpa}
              onChange={(e) => setForm((f) => ({ ...f, cgpa: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 3.8"
            />
          </div>
        </section>

        {/* Fields of interest */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Fields of interest</h2>
          <div className="flex flex-wrap gap-2">
            {FIELDS.map((f) => {
              const active = form.fieldsOfInterest.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, fieldsOfInterest: toggleItem(prev.fieldsOfInterest, f) }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {active && <Check className="inline w-3 h-3 mr-1" />}
                  {f}
                </button>
              );
            })}
          </div>
        </section>

        {/* Opportunity types */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Opportunity types</h2>
          <div className="flex flex-wrap gap-2">
            {OPPORTUNITY_TYPES.map((t) => {
              const active = form.opportunityTypes.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, opportunityTypes: toggleItem(prev.opportunityTypes, t) }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {active && <Check className="inline w-3 h-3 mr-1" />}
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        {/* Save button */}
        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save changes
        </Button>

        {/* Danger zone */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-900/50 p-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Permanently delete your account and all your data. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete my account
          </Button>
        </section>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Delete account</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              This will permanently delete your account, profile, and all your match data. Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3.5 py-2.5 mb-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-2"
                disabled={deleteConfirm !== "DELETE"}
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
