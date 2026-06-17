"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface PriorityGap {
  skill: string;
  importance: "high" | "medium" | "low";
}

interface GapResult {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  bonus_skills: string[];
  priority_gaps: PriorityGap[];
  recommendation: string;
  jd_skills_total: number;
  resume_skills_total: number;
}

export default function GapAnalysisPage() {
  const { user } = useUser();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GapResult | null>(null);
  const [hasResume, setHasResume] = useState(false);

  // Fetch user's latest resume text on load
  useEffect(() => {
    if (user?.id) {
      fetchLatestResume();
    }
  }, [user]);

  const fetchLatestResume = async () => {
    try {
      const response = await axios.get(
        `https://placement-iq-api.onrender.com/api/resume/latest/${user?.id}`
      );
      if (response.data.resume) {
        setResumeText(response.data.resume.parsed_text || "");
        setHasResume(true);
      }
    } catch (error) {
      setHasResume(false);
    }
  };

  const handleAnalyse = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first");
      return;
    }
    if (!resumeText.trim()) {
      toast.error("No resume found. Please upload your resume in Resume Scorer first.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://placement-iq-api.onrender.com/api/gap-analysis/analyse",
        {
          resume_text: resumeText,
          job_description: jobDescription,
          company_name: companyName || "the company",
          job_title: jobTitle || "this role",
          clerk_user_id: user?.id,
        }
      );
      setResult(response.data.analysis);
      toast.success("Gap analysis complete!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    if (importance === "high") return "bg-red-50 text-red-700 border-red-200";
    if (importance === "medium") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const getMatchColor = (pct: number) => {
    if (pct >= 75) return "text-green-600";
    if (pct >= 50) return "text-yellow-600";
    return "text-red-500";
  };

  const getMatchBg = (pct: number) => {
    if (pct >= 75) return "bg-green-50 border-green-200";
    if (pct >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-medium text-gray-900">Skill Gap Analyser</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analyser</h1>
          <p className="text-gray-500 mt-1">
            Paste any job description and see exactly which skills you have and which you need
          </p>
        </div>

        {/* Resume status banner */}
        {!hasResume && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-amber-800 font-medium text-sm">No resume uploaded yet</p>
              <p className="text-amber-600 text-xs mt-1">
                Upload your resume in Resume Scorer first for accurate gap analysis
              </p>
            </div>
            <Link href="/dashboard/resume">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700">
                Upload resume →
              </Button>
            </Link>
          </div>
        )}

        {hasResume && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-800 text-sm font-medium">
              ✓ Resume loaded — ready for gap analysis
            </p>
          </div>
        )}

        {/* Input form */}
        {!result && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Infosys, Zerodha"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Software Engineer, Data Analyst"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job description *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here — include requirements, skills, and responsibilities..."
                rows={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                {jobDescription.length} characters — paste at least 200 characters for best results
              </p>
            </div>

            {/* Manual resume text input if no resume uploaded */}
            {!hasResume && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or paste your resume text manually
                </label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume content here..."
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            <Button
              onClick={handleAnalyse}
              disabled={loading || !jobDescription.trim()}
              className="w-full"
              size="lg"
            >
              {loading ? "Analysing skill gap..." : "Analyse skill gap →"}
            </Button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">

            {/* Match score */}
            <div className={`border-2 rounded-2xl p-8 text-center ${getMatchBg(result.match_percentage)}`}>
              <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Skill match for {jobTitle || "this role"} {companyName ? `at ${companyName}` : ""}
              </div>
              <div className={`text-7xl font-bold mb-2 ${getMatchColor(result.match_percentage)}`}>
                {result.match_percentage}%
              </div>
              <div className="text-gray-500 text-sm">
                {result.matched_skills.length} of {result.jd_skills_total} required skills matched
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-2">AI recommendation</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{result.recommendation}</p>
            </div>

            {/* Priority gaps */}
            {result.priority_gaps.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Skills to learn ({result.priority_gaps.length})
                </h2>
                <div className="space-y-2">
                  {result.priority_gaps.map((gap) => (
                    <div
                      key={gap.skill}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {gap.skill}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getImportanceColor(gap.importance)}`}>
                        {gap.importance} priority
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched skills */}
            {result.matched_skills.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Skills you already have ({result.matched_skills.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.matched_skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium capitalize"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bonus skills */}
            {result.bonus_skills.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Bonus skills you have beyond the JD ({result.bonus_skills.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.bonus_skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium capitalize"
                    >
                      + {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Analyse another */}
            <button
              onClick={() => {
                setResult(null);
                setJobDescription("");
                setCompanyName("");
                setJobTitle("");
              }}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Analyse a different job description
            </button>
          </div>
        )}
      </div>
    </div>
  );
}