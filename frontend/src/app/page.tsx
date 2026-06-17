import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">PI</span>
          </div>
          <span className="font-semibold text-gray-900">PlacementIQ</span>
        </div>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-100">
          AI-powered placement prep
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Get placed at your{" "}
          <span className="text-blue-600">dream company</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Upload your resume, analyse skill gaps, get a personalised roadmap,
          and practice mock interviews — all powered by AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Go to dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Start for free
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              icon: "📄",
              title: "ATS Resume Scorer",
              desc: "Upload your PDF and instantly see your ATS score with specific improvement tips.",
            },
            {
              icon: "🎯",
              title: "Skill Gap Analyser",
              desc: "Paste any job description and see exactly what skills you are missing.",
            },
            {
              icon: "🤖",
              title: "AI Mock Interviews",
              desc: "Practice with an AI interviewer that gives detailed feedback on every answer.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats section */}
      <section className="bg-gray-50 border-t border-gray-100 px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "5", label: "AI-powered features" },
            { value: "40+", label: "Skills tracked" },
            { value: "Free", label: "To get started" },
            { value: "10 min", label: "To first insight" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}