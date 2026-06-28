"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Radar, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../src/contexts/AuthContext";
import { upsertProfile, getProfile } from "../../src/lib/queries";
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

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    educationLevel: "" as EducationLevel | "",
    country: "",
    cgpa: "",
    fieldsOfInterest: [] as string[],
    targetCountry: "Anywhere",
    opportunityTypes: [] as string[],
    notificationPref: "daily" as "daily" | "weekly" | "off",
  });

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
    if (user?.user_metadata?.full_name) {
      setForm((f) => ({ ...f, fullName: user.user_metadata.full_name }));
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((profile) => {
      if (profile) router.push("/dashboard");
    });
  }, [user, router]);

  const toggleItem = (arr: string[], item: string): string[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const handleFinish = async () => {
    if (!user) return;
    if (form.opportunityTypes.length === 0) {
      toast.error("Select at least one opportunity type");
      return;
    }
    setSaving(true);
    try {
      await upsertProfile({
        id: user.id,
        full_name: form.fullName,
        education_level: form.educationLevel as EducationLevel,
        country: form.country,
        cgpa: form.cgpa ? parseFloat(form.cgpa) : null,
        field_of_interest: form.fieldsOfInterest,
        target_country: form.targetCountry || "Anywhere",
        opportunity_types: form.opportunityTypes.map((t) => t.toLowerCase().replace(/ /g, "_")),
      });
      toast.success("Profile created! Welcome to OpportunityRadar 🎉");
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="flex items-center gap-2 mb-8 text-gray-900 dark:text-white font-bold text-xl">
        <Radar className="w-6 h-6 text-indigo-600" />
        OpportunityRadar
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        {/* Step indicator */}
        <div className="px-8 pt-6 pb-2 flex items-center justify-between">
          <p className="text-sm text-gray-400 dark:text-gray-500">Step {step} of {TOTAL_STEPS}</p>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-8 pb-8 pt-4">
          {/* Step 1 */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">About you</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Tell us a bit about yourself so we can personalise your matches.</p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Jane Doe"
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
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your interests</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select all the fields that match your expertise or curiosity.</p>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Fields of interest</label>
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
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                        }`}
                      >
                        {active && <Check className="inline w-3 h-3 mr-1" />}
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target country for opportunities</label>
                <input
                  type="text"
                  value={form.targetCountry}
                  onChange={(e) => setForm((f) => ({ ...f, targetCountry: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Anywhere"
                />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">What you&apos;re looking for</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select at least one opportunity type to get started.</p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Opportunity types</label>
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
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                        }`}
                      >
                        {active && <Check className="inline w-3 h-3 mr-1" />}
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Email notifications</label>
                <div className="flex gap-2">
                  {(["daily", "weekly", "off"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, notificationPref: opt }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                        form.notificationPref === opt
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400"
                      }`}
                    >
                      {opt === "daily" ? "Daily digest" : opt === "weekly" ? "Weekly digest" : "Off"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button onClick={() => setStep((s) => s + 1)} className="gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Finish setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
