"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

interface ScoreBreakdown {
  sections: number;
  skills: number;
  content: number;
  formatting: number;
}

interface Analysis {
  ats_score: number;
  score_breakdown: ScoreBreakdown;
  skills_found: string[];
  missing_keywords: string[];
  suggestions: string[];
  word_count: number;
}

export default function ResumePage() {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file only");
      return;
    }

    setFileName(file.name);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (!user?.id) {
        toast.error("Please sign in first");
        return;
        }
      console.log("Uploading for user:", user.id);  // check this in browser console
      const response = await axios.post(
          "http://localhost:8000/api/resume/upload",
           formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "clerk-user-id": user?.id || "",
                    "clerk-user-email": user?.primaryEmailAddress?.emailAddress || "",
                    },
             }
          );

      setAnalysis(response.data.analysis);
      toast.success("Resume analysed successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to analyse resume. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-green-50 border-green-200";
    if (score >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "Strong";
    if (score >= 50) return "Needs work";
    return "Weak";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-medium text-gray-900">Resume Scorer</span>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">ATS Resume Scorer</h1>
          <p className="text-gray-500 mt-1">
            Upload your PDF resume and instantly see how ATS systems will score it
          </p>
        </div>

        {/* Upload area */}
        {!analysis && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-5xl mb-4">📄</div>
            {uploading ? (
              <div>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Analysing your resume...
                </div>
                <div className="text-sm text-gray-500">
                  Extracting text, checking sections, calculating ATS score
                </div>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : isDragActive ? (
              <div className="text-lg font-medium text-blue-600">
                Drop your resume here
              </div>
            ) : (
              <div>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your resume here
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  or click to browse files
                </div>
                <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  Choose PDF file
                </div>
                <div className="text-xs text-gray-400 mt-3">
                  PDF only • Maximum 5MB • Text-based PDFs only
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-6">

            {/* Overall score card */}
            <div className={`border-2 rounded-2xl p-8 text-center ${getScoreBg(analysis.ats_score)}`}>
              <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                ATS Score for {fileName}
              </div>
              <div className={`text-7xl font-bold mb-2 ${getScoreColor(analysis.ats_score)}`}>
                {analysis.ats_score}
              </div>
              <div className="text-gray-500 text-sm mb-1">out of 100</div>
              <div className={`text-lg font-semibold ${getScoreColor(analysis.ats_score)}`}>
                {getScoreLabel(analysis.ats_score)}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {analysis.word_count} words detected
              </div>
            </div>

            {/* Score breakdown */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Score breakdown</h2>
              <div className="space-y-4">
                {[
                  { label: "Resume sections", key: "sections", max: 40, desc: "Contact, Education, Skills, Projects, Experience" },
                  { label: "Technical skills", key: "skills", max: 30, desc: "Programming languages, frameworks, tools" },
                  { label: "Content quality", key: "content", max: 20, desc: "Word count, detail level, descriptions" },
                  { label: "Formatting", key: "formatting", max: 10, desc: "Email, links, structure signals" },
                ].map((item) => {
                  const val = analysis.score_breakdown[item.key as keyof ScoreBreakdown];
                  const pct = Math.round((val / item.max) * 100);
                  return (
                    <div key={item.key}>
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{item.label}</span>
                          <span className="text-xs text-gray-400 ml-2">{item.desc}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {val}/{item.max}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills found */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Skills detected ({analysis.skills_found.length})
              </h2>
              {analysis.skills_found.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.skills_found.map((skill) => (
                    <span
                      key={skill}
                      className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No technical skills detected. Add a dedicated Skills section with specific technologies.
                </p>
              )}
            </div>

            {/* Improvement suggestions */}
            {analysis.suggestions.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  How to improve your score
                </h2>
                <div className="space-y-3">
                  {analysis.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload another */}
            <button
              onClick={() => { setAnalysis(null); setFileName(""); }}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Upload a different resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}