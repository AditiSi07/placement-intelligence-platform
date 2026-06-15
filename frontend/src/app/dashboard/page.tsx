import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <DashboardClient
      userName={user.firstName || "Student"}
      userEmail={user.emailAddresses[0]?.emailAddress || ""}
      userInitials={(user.firstName?.[0] || "S") + (user.lastName?.[0] || "")}
    />
  );
}