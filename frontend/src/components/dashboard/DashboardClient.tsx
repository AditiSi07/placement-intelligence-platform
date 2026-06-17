"use client";

import { UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    title: "Resume Scorer",
    description: "Upload your resume and get an ATS compatibility score",
    status: "Live",
    icon: "📄",
    href: "/dashboard/resume",
    available: true,
  },
  {
    title: "Skill Gap Analyser",
    description: "Compare your skills against any job description",
    status: "Live",
    icon: "🎯",
    href: "/dashboard/gap-analysis",
    available: true,
  },
  {
    title: "Placement Analytics",
    description: "Browse company-wise placement history from your college",
    status: "Live",
    icon: "📊",
    href: "/dashboard/analytics",
    available: true,
  },
  {
    title: "AI Roadmap",
    description: "Get a personalised week-by-week learning plan",
    status: "Live",
    icon: "🗺️",
    href: "/dashboard/roadmap",
    available: true,
  },
  {
    title: "Mock Interview",
    description: "Practice with an AI interviewer and get feedback",
    status: "Live",
    icon: "🤖",
    href: "/dashboard/interview",
    available: true,
  },
];

interface Props {
  userName: string;
  userEmail: string;
  userInitials: string;
  resumeScore: number | null;
  interviewCount: number;
}

export default function DashboardClient({ userName, userEmail, userInitials, resumeScore, interviewCount }: Props) {
  const displayName = userName === "Student"
    ? userEmail.split("@")[0]
    : userName;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">PI</span>
          </div>
          <span className="font-semibold text-gray-900">PlacementIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block truncate max-w-48">
            {userEmail}
          </span>
          <UserButton />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">

        {/* Welcome */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Track your placement preparation progress
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
         {[
  { label: "Resume score", value: resumeScore ? `${resumeScore}%` : "—" },
  { label: "Skills matched", value: "—" },
  { label: "Mock interviews", value: interviewCount.toString() },
  { label: "Roadmap progress", value: "0%" },
].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-100 rounded-xl p-3 md:p-4 text-center"
            >
              <div className="text-xl md:text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl md:text-2xl">{f.icon}</span>
                    <CardTitle className="text-sm md:text-base font-semibold">
                      {f.title}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-50 text-green-700 border-green-100"
                  >
                    {f.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                  {f.description}
                </p>
                <Link href={f.href}>
                  <Button size="sm" className="w-full">
                    Open →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}