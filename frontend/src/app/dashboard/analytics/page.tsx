"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface Company {
  id: string;
  company_name: string;
  job_title: string;
  package_lpa: number;
  sector: string;
  eligible_branches: string[];
  min_cgpa: number;
  bond_years: number;
  job_type: string;
  skills_tested: string[];
  selection_process: string[];
  students_placed: number;
  college?: string;
}

interface Analytics {
  total_companies: number;
  total_students_placed: number;
  avg_package: number;
  highest_package: number;
  sector_breakdown: Record<string, number>;
  top_companies_by_package: Array<{ company: string; package: number }>;
}

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AIDS", "AIML"];
const SECTORS = ["IT", "Finance", "Fintech", "Core", "Consulting"];

export default function AnalyticsPage() {
  const { user } = useUser();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    sector: "",
    branch: "",
    min_package: "",
  });
  const [activeTab, setActiveTab] = useState<"browse" | "eligible" | "upload">("browse");
  const [eligibleCompanies, setEligibleCompanies] = useState<Company[]>([]);

  useEffect(() => {
    fetchCompanies();
    fetchAnalytics();
    if (user?.id) fetchEligible();
  }, [user]);

  const fetchCompanies = async (customFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (customFilters.search) params.append("search", customFilters.search);
      if (customFilters.sector) params.append("sector", customFilters.sector);
      if (customFilters.branch) params.append("branch", customFilters.branch);
      if (customFilters.min_package) params.append("min_package", customFilters.min_package);

      const response = await axios.get(
        `https://placement-iq-api.onrender.com/api/placement/companies?${params.toString()}`
      );
      setCompanies(response.data.companies);
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("https://placement-iq-api.onrender.com/api/placement/analytics");
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error("Analytics fetch failed");
    }
  };

  const fetchEligible = async () => {
    try {
      const response = await axios.get(
        `https://placement-iq-api.onrender.com/api/placement/eligible/${user?.id}`
      );
      setEligibleCompanies(response.data.companies);
    } catch (error) {
      console.error("Eligible fetch failed");
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://placement-iq-api.onrender.com/api/placement/upload-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "clerk-user-id": user?.id || "",
          },
        }
      );
      toast.success(`Imported ${response.data.records_imported} records!`);
      fetchCompanies();
      fetchAnalytics();
      setActiveTab("browse");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchCompanies(newFilters);
  };

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      IT: "bg-blue-50 text-blue-700",
      Finance: "bg-green-50 text-green-700",
      Fintech: "bg-purple-50 text-purple-700",
      Core: "bg-orange-50 text-orange-700",
      Consulting: "bg-yellow-50 text-yellow-700",
    };
    return colors[sector] || "bg-gray-50 text-gray-700";
  };

  const displayCompanies = activeTab === "eligible" ? eligibleCompanies : companies;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-medium text-gray-900">Placement Analytics</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Placement Analytics</h1>
            <p className="text-gray-500 mt-1">
              Browse company-wise placement history and check your eligibility
            </p>
          </div>
        </div>

        {/* Stats row */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Companies", value: analytics.total_companies },
              { label: "Students placed", value: analytics.total_students_placed },
              { label: "Avg package", value: `${analytics.avg_package} LPA` },
              { label: "Highest package", value: `${analytics.highest_package} LPA` },
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
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "browse", label: "All companies" },
            { key: "eligible", label: `Eligible for me (${eligibleCompanies.length})` },
            { key: "upload", label: "Upload data" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload tab */}
{/* Upload tab */}
{activeTab === "upload" && (
  <div className="bg-white border border-gray-100 rounded-2xl p-8">
    <h2 className="font-semibold text-gray-900 mb-2">Upload placement data</h2>
    <p className="text-gray-500 text-sm mb-6">
      Upload a CSV file with company placement records.
      Use the sample CSV file from the docs/ folder in your project.
    </p>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-3">📊</div>
              {uploading ? (
                <div className="text-gray-600">Importing records...</div>
              ) : isDragActive ? (
                <div className="text-blue-600 font-medium">Drop CSV here</div>
              ) : (
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    Drag and drop your CSV file
                  </div>
                  <div className="text-sm text-gray-500">or click to browse</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browse / Eligible tabs */}
        {activeTab !== "upload" && (
          <div>
            {/* Filters — only show on browse tab */}
            {activeTab === "browse" && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Search company..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filters.sector}
                  onChange={(e) => handleFilterChange("sector", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All sectors</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={filters.branch}
                  onChange={(e) => handleFilterChange("branch", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All branches</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Min package (LPA)"
                  value={filters.min_package}
                  onChange={(e) => handleFilterChange("min_package", e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Company cards */}
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading companies...</div>
            ) : displayCompanies.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                <div className="text-4xl mb-3">📭</div>
                <div className="font-medium text-gray-900 mb-1">No companies found</div>
                <div className="text-sm text-gray-500 mb-4">
                  {activeTab === "eligible"
                    ? "Update your profile with your branch and CGPA to see eligible companies"
                    : "Upload placement data using the Upload tab to get started"}
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("upload")}
                  variant="outline"
                >
                  Upload placement data
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
                  >
                    {/* Company header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {company.company_name}
                        </h3>
                        <p className="text-sm text-gray-500">{company.job_title}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ₹{company.package_lpa} LPA
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getSectorColor(company.sector)}`}
                        >
                          {company.sector}
                        </span>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                      <div>
                        <span className="font-medium text-gray-700">Min CGPA:</span>{" "}
                        {company.min_cgpa}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Placed:</span>{" "}
                        {company.students_placed} students
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Bond:</span>{" "}
                        {company.bond_years === 0
                          ? "No bond"
                          : `${company.bond_years} years`}
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>{" "}
                        {company.job_type}
                      </div>
                    </div>

                    {/* Eligible branches */}
                    {company.eligible_branches?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Eligible branches:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {company.eligible_branches.map((b) => (
                            <span
                              key={b}
                              className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills tested */}
                    {company.skills_tested?.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          Skills tested:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {company.skills_tested.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200"
                            >
                              {s}
                            </span>
                          ))}
                          {company.skills_tested.length > 4 && (
                            <span className="text-xs text-gray-400">
                              +{company.skills_tested.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}