import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    title: "Resume Scorer",
    description: "Upload your resume and get an ATS compatibility score",
    status: "Coming Week 3",
    icon: "📄",
    href: "/dashboard/resume",
  },
  {
    title: "Skill Gap Analyser",
    description: "Compare your skills against any job description",
    status: "Coming Week 4",
    icon: "🎯",
    href: "/dashboard/gap-analysis",
  },
  {
    title: "Placement Analytics",
    description: "Browse company-wise placement history from your college",
    status: "Coming Week 5",
    icon: "📊",
    href: "/dashboard/analytics",
  },
  {
    title: "AI Roadmap",
    description: "Get a personalised week-by-week learning plan",
    status: "Coming Week 6",
    icon: "🗺️",
    href: "/dashboard/roadmap",
  },
  {
    title: "Mock Interview",
    description: "Practice with an AI interviewer and get feedback",
    status: "Coming Week 7",
    icon: "🤖",
    href: "/dashboard/interview",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PI</span>
          </div>
          <span className="font-semibold text-gray-900">PlacementIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Welcome back</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 text-sm font-medium">U</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Track your placement preparation progress
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Resume score", value: "—" },
            { label: "Skills matched", value: "—" },
            { label: "Mock interviews", value: "0" },
            { label: "Roadmap progress", value: "0%" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-100 rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <Card
              key={f.title}
              className="border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{f.icon}</span>
                    <CardTitle className="text-base font-semibold">
                      {f.title}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs text-gray-400 bg-gray-50"
                  >
                    {f.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{f.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}