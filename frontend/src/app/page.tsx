import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">PI</span>
          </div>
          <span className="font-semibold text-gray-900">PlacementIQ</span>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm">Go to dashboard →</Button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get started free</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-100">
          AI-powered placement prep
        </Badge>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Get placed at your{" "}
          <span className="text-blue-600">dream company</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Upload your resume, analyse skill gaps, get a personalised roadmap,
          and practice mock interviews — all powered by AI.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="px-8">Start for free</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="px-8">View demo</Button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "📄",
              title: "ATS Resume Scorer",
              desc: "Upload your PDF and instantly see your ATS score with specific improvement tips.",
            },
            {
              icon: "🎯",
              title: "Skill Gap Analyser",
              desc: "Paste any job description and see exactly what skills you're missing.",
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
    </main>
  );
}

