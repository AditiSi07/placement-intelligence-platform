"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface RoadmapHistory {
  id: string;
  target_company: string;
  target_role: string;
  weeks_available: number;
  roadmap_content: string;
  created_at: string;
}

export default function RoadmapPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState("");
  const [history, setHistory] = useState<RoadmapHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({
    target_company: "",
    target_role: "",
    weeks_available: "8",
    current_skills: "",
    missing_skills: "",
  });

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        `https://placement-iq-api.onrender.com/api/roadmap/history/${user?.id}`
      );
      setHistory(response.data.roadmaps);
    } catch (error) {
      console.error("History fetch failed");
    }
  };

  const handleGenerate = async () => {
    if (!form.target_company.trim()) {
      toast.error("Please enter a target company");
      return;
    }
    if (!form.target_role.trim()) {
      toast.error("Please enter a target role");
      return;
    }

    setLoading(true);
    setRoadmap("");

    try {
      const currentSkillsList = form.current_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const missingSkillsList = form.missing_skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await axios.post(
        "https://placement-iq-api.onrender.com/api/roadmap/generate",
        {
          clerk_user_id: user?.id,
          target_company: form.target_company,
          target_role: form.target_role,
          weeks_available: parseInt(form.weeks_available),
          current_skills: currentSkillsList,
          missing_skills: missingSkillsList,
        }
      );

      setRoadmap(response.data.roadmap);
      toast.success("Roadmap generated!");
      fetchHistory();
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to generate roadmap. Check your Groq API key."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatRoadmap = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("WEEK")) {
        return (
          <div key={i} className="mt-6 mb-2">
            <h3 className="text-base font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
              {line}
            </h3>
          </div>
        );
      }
      if (line.startsWith("Goal:") || line.startsWith("Milestone:") || line.startsWith("Daily Plan:")) {
        return (
          <p key={i} className="text-sm font-medium text-gray-800 mt-2 mb-1">
            {line}
          </p>
        );
      }
      if (line.startsWith("Topics:") || line.startsWith("Resources:")) {
        return (
          <p key={i} className="text-sm font-semibold text-gray-700 mt-2">
            {line}
          </p>
        );
      }
      if (line.startsWith("- ")) {
        return (
          <p key={i} className="text-sm text-gray-600 ml-4 my-0.5">
            {line}
          </p>
        );
      }
      if (line.startsWith("---")) {
        return <hr key={i} className="my-4 border-gray-100" />;
      }
      if (line.trim() === "") {
        return <div key={i} className="h-1" />;
      }
      return (
        <p key={i} className="text-sm text-gray-600">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-medium text-gray-900">AI Roadmap Generator</span>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="ml-auto text-sm text-blue-600 hover:underline"
          >
            {showHistory ? "Hide history" : `View past roadmaps (${history.length})`}
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AI Roadmap Generator</h1>
          <p className="text-gray-500 mt-1">
            Get a personalised week-by-week learning plan powered by Llama 3.3 70B
          </p>
        </div>

        {/* History panel */}
        {showHistory && history.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Past roadmaps</h2>
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  onClick={() => {
                    setRoadmap(h.roadmap_content);
                    setShowHistory(false);
                    window.scrollTo(0, 400);
                  }}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {h.target_role} at {h.target_company}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {h.weeks_available} weeks
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(h.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tell us your goal</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target company *
              </label>
              <input
                type="text"
                value={form.target_company}
                onChange={(e) => setForm({ ...form, target_company: e.target.value })}
                placeholder="e.g. Google, Infosys, Zerodha"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target role *
              </label>
              <input
                type="text"
                value={form.target_role}
                onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                placeholder="e.g. Software Engineer, Data Analyst"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weeks available for preparation
            </label>
            <select
              value={form.weeks_available}
              onChange={(e) => setForm({ ...form, weeks_available: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[4, 6, 8, 10, 12, 16].map((w) => (
                <option key={w} value={w}>{w} weeks</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills you already have
              <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
            </label>
            <input
              type="text"
              value={form.current_skills}
              onChange={(e) => setForm({ ...form, current_skills: e.target.value })}
              placeholder="e.g. Python, React, SQL, Git"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills you need to learn
              <span className="text-gray-400 font-normal ml-1">(comma separated — from your gap analysis)</span>
            </label>
            <input
              type="text"
              value={form.missing_skills}
              onChange={(e) => setForm({ ...form, missing_skills: e.target.value })}
              placeholder="e.g. System Design, Docker, Machine Learning"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading
              ? "Generating your roadmap... (takes 10-15 seconds)"
              : "Generate my personalised roadmap →"}
          </Button>

          {loading && (
            <p className="text-center text-xs text-gray-400 mt-3">
              Llama 3.3 70B is creating your personalised plan...
            </p>
          )}
        </div>

        {/* Roadmap output */}
        {roadmap && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">
                Your personalised roadmap
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roadmap);
                    toast.success("Roadmap copied to clipboard!");
                  }}
                  className="text-xs text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50"
                >
                  Copy text
                </button>
                <button
                  onClick={() => {
                    setRoadmap("");
                    setForm({
                      target_company: "",
                      target_role: "",
                      weeks_available: "8",
                      current_skills: "",
                      missing_skills: "",
                    });
                  }}
                  className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50"
                >
                  Generate new
                </button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              {formatRoadmap(roadmap)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}