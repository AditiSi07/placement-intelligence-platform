"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type InterviewStatus = "setup" | "in_progress" | "evaluating" | "completed";

interface QA {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  ideal_answer_hint: string;
}

interface FinalFeedback {
  overall_assessment: string;
  strengths: string[];
  areas_to_improve: string[];
  recommended_topics: string[];
  readiness: string;
  next_steps: string;
}

export default function InterviewPage() {
  const { user } = useUser();
  const [status, setStatus] = useState<InterviewStatus>("setup");
  const [interviewId, setInterviewId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [transcript, setTranscript] = useState<QA[]>([]);
  const [lastEvaluation, setLastEvaluation] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  const [config, setConfig] = useState({
    target_company: "",
    target_role: "",
    interview_type: "technical",
    difficulty: "medium",
    total_questions: 5,
    skills_to_test: "",
  });

  const totalQuestions = config.total_questions;

  const handleStart = async () => {
    if (!config.target_company.trim() || !config.target_role.trim()) {
      toast.error("Please enter target company and role");
      return;
    }

    setLoading(true);
    try {
      const skillsList = config.skills_to_test
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await axios.post(
        "http://localhost:8000/api/interview/start",
        {
          clerk_user_id: user?.id,
          target_company: config.target_company,
          target_role: config.target_role,
          interview_type: config.interview_type,
          difficulty: config.difficulty,
          total_questions: config.total_questions,
          skills_to_test: skillsList,
        }
      );

      setInterviewId(response.data.interview_id);
      setCurrentQuestion(response.data.first_question);
      setPreviousQuestions([response.data.first_question]);
      setStatus("in_progress");
      setQuestionNumber(1);
      setTimeout(() => answerRef.current?.focus(), 300);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error("Please type your answer before submitting");
      return;
    }

    setStatus("evaluating");
    setLoading(true);

    try {
      // Evaluate answer
      const evalResponse = await axios.post(
        "http://localhost:8000/api/interview/answer",
        {
          interview_id: interviewId,
          question: currentQuestion,
          answer: currentAnswer,
          question_number: questionNumber,
          target_role: config.target_role,
          interview_type: config.interview_type,
          difficulty: config.difficulty,
        }
      );

      const evaluation = evalResponse.data.evaluation;
      setLastEvaluation(evaluation);

      // Add to transcript
      const qaEntry: QA = {
        question: currentQuestion,
        answer: currentAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        ideal_answer_hint: evaluation.ideal_answer_hint || "",
      };

      const newTranscript = [...transcript, qaEntry];
      setTranscript(newTranscript);

      // Check if interview is done
      if (questionNumber >= totalQuestions) {
        await handleEndInterview(newTranscript);
        return;
      }

      // Get next question
      const nextResponse = await axios.post(
        "http://localhost:8000/api/interview/next-question",
        {
          interview_id: interviewId,
          target_company: config.target_company,
          target_role: config.target_role,
          interview_type: config.interview_type,
          difficulty: config.difficulty,
          question_number: questionNumber + 1,
          previous_questions: [...previousQuestions],
          skills_to_test: config.skills_to_test.split(",").map((s) => s.trim()).filter(Boolean),
        }
      );

      setCurrentQuestion(nextResponse.data.question);
      setPreviousQuestions([...previousQuestions, nextResponse.data.question]);
      setCurrentAnswer("");
      setQuestionNumber(questionNumber + 1);
      setStatus("in_progress");
      setTimeout(() => answerRef.current?.focus(), 300);
    } catch (error: any) {
      toast.error("Error processing answer. Please try again.");
      setStatus("in_progress");
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async (finalTranscript: QA[]) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/api/interview/end",
        {
          interview_id: interviewId,
          clerk_user_id: user?.id,
          target_company: config.target_company,
          target_role: config.target_role,
          transcript: finalTranscript,
        }
      );

      setFinalResult(response.data);
      setStatus("completed");
    } catch (error) {
      toast.error("Error generating final feedback");
      setStatus("completed");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-500";
  };

  const getReadinessBadge = (readiness: string) => {
    const styles: Record<string, string> = {
      "Ready": "bg-green-100 text-green-800",
      "Almost Ready": "bg-blue-100 text-blue-800",
      "Needs More Prep": "bg-yellow-100 text-yellow-800",
      "Not Ready": "bg-red-100 text-red-800",
    };
    return styles[readiness] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Dashboard
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-medium text-gray-900">AI Mock Interview</span>
        {status === "in_progress" && (
          <span className="ml-auto text-sm text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* SETUP SCREEN */}
        {status === "setup" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
              <p className="text-gray-500 mt-1">
                Practice with an AI interviewer powered by Llama 3.3 70B and get detailed feedback
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target company *
                  </label>
                  <input
                    type="text"
                    value={config.target_company}
                    onChange={(e) => setConfig({ ...config, target_company: e.target.value })}
                    placeholder="e.g. Google, TCS, Zerodha"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target role *
                  </label>
                  <input
                    type="text"
                    value={config.target_role}
                    onChange={(e) => setConfig({ ...config, target_role: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interview type
                  </label>
                  <select
                    value={config.interview_type}
                    onChange={(e) => setConfig({ ...config, interview_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="technical">Technical</option>
                    <option value="hr">HR / Behavioural</option>
                    <option value="aptitude">Aptitude</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. of questions
                  </label>
                  <select
                    value={config.total_questions}
                    onChange={(e) => setConfig({ ...config, total_questions: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[3, 5, 7, 10].map((n) => (
                      <option key={n} value={n}>{n} questions</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills to focus on
                  <span className="text-gray-400 font-normal ml-1">(comma separated, optional)</span>
                </label>
                <input
                  type="text"
                  value={config.skills_to_test}
                  onChange={(e) => setConfig({ ...config, skills_to_test: e.target.value })}
                  placeholder="e.g. DSA, System Design, Python, SQL"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                <strong>Tips for best results:</strong>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Type detailed answers — AI evaluates depth and accuracy</li>
                  <li>For coding questions, explain your approach even without code</li>
                  <li>Each question takes 10-15 seconds to evaluate</li>
                </ul>
              </div>

              <Button
                onClick={handleStart}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Setting up interview..." : "Start interview →"}
              </Button>
            </div>
          </div>
        )}

        {/* IN PROGRESS SCREEN */}
        {(status === "in_progress" || status === "evaluating") && (
          <div>
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{questionNumber}/{totalQuestions} questions</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Last evaluation feedback */}
            {lastEvaluation && transcript.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Previous answer feedback
                  </span>
                  <span className={`text-lg font-bold ${getScoreColor(lastEvaluation.score)}`}>
                    {lastEvaluation.score}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{lastEvaluation.feedback}</p>
                {lastEvaluation.ideal_answer_hint && (
                  <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    Hint: {lastEvaluation.ideal_answer_hint}
                  </p>
                )}
              </div>
            )}

            {/* Current question */}
            <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Question {questionNumber}
                </span>
                <span className="text-xs text-gray-400 capitalize">
                  {config.interview_type} • {config.difficulty}
                </span>
              </div>
              <p className="text-gray-900 font-medium leading-relaxed">
                {currentQuestion}
              </p>
            </div>

            {/* Answer input */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your answer
              </label>
              <textarea
                ref={answerRef}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here. Be as detailed as possible — explain your thinking, approach, and any relevant examples..."
                rows={8}
                disabled={status === "evaluating"}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {currentAnswer.length} characters
                </span>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={status === "evaluating" || !currentAnswer.trim()}
                  size="sm"
                >
                  {status === "evaluating"
                    ? "Evaluating..."
                    : questionNumber === totalQuestions
                    ? "Submit final answer →"
                    : "Submit answer →"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETED SCREEN */}
        {status === "completed" && finalResult && (
          <div className="space-y-6">

            {/* Overall score */}
            <div className={`border-2 rounded-2xl p-8 text-center ${
              finalResult.overall_score >= 7
                ? "bg-green-50 border-green-200"
                : finalResult.overall_score >= 5
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Interview complete — {config.target_role} at {config.target_company}
              </div>
              <div className={`text-7xl font-bold mb-2 ${getScoreColor(finalResult.overall_score)}`}>
                {finalResult.overall_score}
              </div>
              <div className="text-gray-500 text-sm mb-3">out of 10</div>
              {finalResult.feedback?.readiness && (
                <span className={`text-sm font-semibold px-4 py-2 rounded-full ${getReadinessBadge(finalResult.feedback.readiness)}`}>
                  {finalResult.feedback.readiness}
                </span>
              )}
            </div>

            {/* Overall assessment */}
            {finalResult.feedback?.overall_assessment && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Overall assessment</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {finalResult.feedback.overall_assessment}
                </p>
              </div>
            )}

            {/* Strengths and improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalResult.feedback?.strengths?.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <h2 className="font-semibold text-green-900 mb-3">Strengths</h2>
                  <ul className="space-y-2">
                    {finalResult.feedback.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-green-800">
                        <span>✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalResult.feedback?.areas_to_improve?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <h2 className="font-semibold text-amber-900 mb-3">Areas to improve</h2>
                  <ul className="space-y-2">
                    {finalResult.feedback.areas_to_improve.map((a: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-amber-800">
                        <span>→</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommended topics */}
            {finalResult.feedback?.recommended_topics?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Topics to study next</h2>
                <div className="flex flex-wrap gap-2">
                  {finalResult.feedback.recommended_topics.map((t: string, i: number) => (
                    <span key={i} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Next steps */}
            {finalResult.feedback?.next_steps && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-2">Next steps</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {finalResult.feedback.next_steps}
                </p>
              </div>
            )}

            {/* Q&A Review */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Question-by-question review
              </h2>
              <div className="space-y-4">
                {transcript.map((qa, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        Q{i + 1}
                      </span>
                      <span className={`text-sm font-bold ${getScoreColor(qa.score)}`}>
                        {qa.score}/10
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">{qa.question}</p>
                    <p className="text-xs text-gray-500 mb-2 bg-gray-50 p-2 rounded">
                      Your answer: {qa.answer.slice(0, 150)}{qa.answer.length > 150 ? "..." : ""}
                    </p>
                    <p className="text-xs text-gray-600">{qa.feedback}</p>
                    {qa.ideal_answer_hint && (
                      <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded">
                        Hint: {qa.ideal_answer_hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStatus("setup");
                  setTranscript([]);
                  setLastEvaluation(null);
                  setFinalResult(null);
                  setCurrentAnswer("");
                  setQuestionNumber(1);
                  setPreviousQuestions([]);
                }}
                variant="outline"
                className="flex-1"
              >
                Take another interview
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">Back to dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}