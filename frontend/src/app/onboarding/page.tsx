"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    college: "",
    branch: "",
    graduation_year: "",
    cgpa: "",
    phone: "",
    linkedin_url: "",
    github_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.college || !form.branch || !form.graduation_year) {
      toast.error("Please fill in college, branch, and graduation year");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/users/onboard", {
        email: user?.primaryEmailAddress?.emailAddress,
        full_name: user?.fullName,
        clerk_id: user?.id,
        ...form,
      });
      toast.success("Profile set up successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-lg">

        {/* Header */}
        <div className="mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold">PI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.firstName}!
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Tell us about yourself so we can personalise your placement prep.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="college" className="text-sm font-medium text-gray-700">
              College name *
            </Label>
            <Input
              id="college"
              name="college"
              placeholder="e.g. IIT Kanpur, BITS Pilani, VIT Vellore"
              value={form.college}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch" className="text-sm font-medium text-gray-700">
                Branch *
              </Label>
              <select
                id="branch"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select branch</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">Mechanical</option>
                <option value="CIVIL">Civil</option>
                <option value="CHEM">Chemical</option>
                <option value="AIDS">AI & DS</option>
                <option value="AIML">AI & ML</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="graduation_year" className="text-sm font-medium text-gray-700">
                Graduation year *
              </Label>
              <select
                id="graduation_year"
                name="graduation_year"
                value={form.graduation_year}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select year</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cgpa" className="text-sm font-medium text-gray-700">
                Current CGPA
              </Label>
              <Input
                id="cgpa"
                name="cgpa"
                placeholder="e.g. 8.5"
                value={form.cgpa}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone number
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkedin_url" className="text-sm font-medium text-gray-700">
              LinkedIn URL
            </Label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              placeholder="https://linkedin.com/in/yourname"
              value={form.linkedin_url}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="github_url" className="text-sm font-medium text-gray-700">
              GitHub URL
            </Label>
            <Input
              id="github_url"
              name="github_url"
              placeholder="https://github.com/yourusername"
              value={form.github_url}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6"
          size="lg"
        >
          {loading ? "Setting up your profile..." : "Complete setup →"}
        </Button>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can update these details anytime from your profile settings.
        </p>
      </div>
    </div>
  );
}