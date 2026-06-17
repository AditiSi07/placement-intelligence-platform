import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";
import axios from "axios";

async function getUserStats(userId: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const [resumeRes, interviewRes] = await Promise.allSettled([
      axios.get(`${API_URL}/api/resume/latest/${userId}`),
      axios.get(`${API_URL}/api/interview/history/${userId}`),
    ]);

    const resumeScore =
      resumeRes.status === "fulfilled" && resumeRes.value.data.resume
        ? resumeRes.value.data.resume.ats_score
        : null;

    const interviewCount =
      interviewRes.status === "fulfilled"
        ? interviewRes.value.data.interviews?.length || 0
        : 0;

    return { resumeScore, interviewCount };
  } catch {
    return { resumeScore: null, interviewCount: 0 };
  }
}

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const stats = await getUserStats(user.id);

  return (
    <DashboardClient
      userName={user.firstName || "Student"}
      userEmail={user.emailAddresses[0]?.emailAddress || ""}
      userInitials={(user.firstName?.[0] || "S") + (user.lastName?.[0] || "")}
      resumeScore={stats.resumeScore}
      interviewCount={stats.interviewCount}
    />
  );
}