"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


type ScreeningResult = {
  qualified?: string | boolean;
  interested?: string | boolean;
  skills_match?: string;
  notice_period?: string;
  expected_salary?: string;
  recruiter_summary?: string;
  relevant_experience?: string;
  interview_availability?: string;
};


type CallDetails = {
  id: string;
  status: string;
  lifecycle_status?: string;
  duration_seconds?: number;
  engagement_status?: string;
  answered_by?: string;
  recording_url?: string;
  result?: ScreeningResult;
};


export default function Home() {
  // Form fields
  const [candidateName, setCandidateName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");

  // Call states
  const [loading, setLoading] = useState(false);
  const [callId, setCallId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [callDetails, setCallDetails] =
    useState<CallDetails | null>(null);


  const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";


  // --------------------------------------------------
  // Validate form
  // --------------------------------------------------

  const validateForm = () => {
    if (!candidateName.trim()) {
      setError("Candidate name is required.");
      return false;
    }

    if (!phoneNumber.trim()) {
      setError("Phone number is required.");
      return false;
    }

    if (!phoneNumber.startsWith("+")) {
      setError(
        "Phone number must include the country code, for example +91..."
      );
      return false;
    }

    if (!/^\+\d{8,15}$/.test(phoneNumber.trim())) {
      setError(
        "Please enter a valid phone number in international format."
      );
      return false;
    }

    if (!companyName.trim()) {
      setError("Company name is required.");
      return false;
    }

    if (!jobTitle.trim()) {
      setError("Job title is required.");
      return false;
    }

    if (!requiredSkills.trim()) {
      setError("Required skills are required.");
      return false;
    }

    setError("");
    return true;
  };


  // --------------------------------------------------
  // Start screening call
  // --------------------------------------------------

  const startScreening = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("");
      setCallId("");
      setCallDetails(null);

      const response = await fetch(
        `${API_BASE_URL}/screening-call`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            callee_name: candidateName.trim(),
            mobile_number: phoneNumber.trim(),
            job_title: jobTitle.trim(),
            required_skills: requiredSkills.trim(),
            company_name: companyName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.message || "Failed to start screening call."
        );
      }

      setCallId(data.id);
      setStatus(data.status);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while starting the screening call."
      );
    } finally {
      setLoading(false);
    }
  };


  // --------------------------------------------------
  // Poll call status
  // --------------------------------------------------

  useEffect(() => {
    if (!callId) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval>;

    const checkCallStatus = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/calls/${callId}`
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(
            data.message || "Failed to fetch call status."
          );
        }

        setStatus(data.status);
        setCallDetails(data);

        /*
          Hunar may mark the call COMPLETED slightly
          before the structured result is generated.

          Therefore, only stop polling when BOTH:
          1. Call is completed
          2. Structured result exists
        */

        const hasResult =
          data.result &&
          Object.keys(data.result).length > 0;

        if (
          (data.status === "COMPLETED" ||
            data.lifecycle_status === "COMPLETED") &&
          hasResult
        ) {
          clearInterval(intervalId);
        }

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to retrieve screening result."
        );
      }
    };

    // Check immediately
    checkCallStatus();

    // Then check every 5 seconds
    intervalId = setInterval(
      checkCallStatus,
      5000
    );

    return () => {
      clearInterval(intervalId);
    };

  }, [callId]);


  // --------------------------------------------------
  // Format boolean results
  // --------------------------------------------------

  const formatBoolean = (
    value?: string | boolean
  ) => {
    if (
      value === true ||
      value === "true"
    ) {
      return "Yes";
    }

    if (
      value === false ||
      value === "false"
    ) {
      return "No";
    }

    return "Not available";
  };


  const result = callDetails?.result;


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100/60">

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* Header */}

        <div className="mb-8">

          <div className="mb-3 flex flex-wrap items-center gap-3">

            <h1 className="text-3xl font-bold tracking-tight text-blue-950">
              AI Hiring Assistant
            </h1>

            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              Hunar Voice AI
            </Badge>

          </div>

          <p className="max-w-2xl text-blue-900/60">
            Screen candidates with an AI-powered voice interview
            and review structured recruitment insights.
          </p>

        </div>


        <div className="grid gap-6 lg:grid-cols-2">

          {/* ==================================================
              LEFT SIDE — SCREENING FORM
          ================================================== */}

          <Card className="border-blue-100 bg-white shadow-sm">

            <CardHeader>

              <CardTitle className="text-blue-950">
                Start Candidate Screening
              </CardTitle>

              <CardDescription>
                Enter the candidate and job details to initiate
                an AI-powered screening call.
              </CardDescription>

            </CardHeader>


            <CardContent className="space-y-5">

              {/* Candidate Name */}

              <div className="space-y-2">

                <Label
                  htmlFor="candidateName"
                  className="text-blue-950"
                >
                  Candidate Name
                </Label>

                <Input
                  id="candidateName"
                  placeholder="e.g. Rahul Sharma"
                  value={candidateName}
                  onChange={(e) =>
                    setCandidateName(
                      e.target.value
                    )
                  }
                  className="border-blue-100 focus-visible:ring-blue-500"
                />

              </div>


              {/* Phone Number */}

              <div className="space-y-2">

                <Label
                  htmlFor="phoneNumber"
                  className="text-blue-950"
                >
                  Phone Number
                </Label>

                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value
                    )
                  }
                  className="border-blue-100 focus-visible:ring-blue-500"
                />

                <p className="text-xs text-muted-foreground">
                  Include the country code, for example +91.
                </p>

              </div>


              {/* Company */}

              <div className="space-y-2">

                <Label
                  htmlFor="companyName"
                  className="text-blue-950"
                >
                  Company
                </Label>

                <Input
                  id="companyName"
                  placeholder="e.g. ABC Technologies"
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(
                      e.target.value
                    )
                  }
                  className="border-blue-100 focus-visible:ring-blue-500"
                />

              </div>


              {/* Job Title */}

              <div className="space-y-2">

                <Label
                  htmlFor="jobTitle"
                  className="text-blue-950"
                >
                  Job Title
                </Label>

                <Input
                  id="jobTitle"
                  placeholder="e.g. AI Engineer"
                  value={jobTitle}
                  onChange={(e) =>
                    setJobTitle(
                      e.target.value
                    )
                  }
                  className="border-blue-100 focus-visible:ring-blue-500"
                />

              </div>


              {/* Required Skills */}

              <div className="space-y-2">

                <Label
                  htmlFor="requiredSkills"
                  className="text-blue-950"
                >
                  Required Skills
                </Label>

                <Textarea
                  id="requiredSkills"
                  placeholder="Python, FastAPI, LLMs, RAG"
                  value={requiredSkills}
                  onChange={(e) =>
                    setRequiredSkills(
                      e.target.value
                    )
                  }
                  className="min-h-[100px] border-blue-100 focus-visible:ring-blue-500"
                />

              </div>


              {/* Start Button */}

              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                size="lg"
                onClick={startScreening}
                disabled={loading}
              >

                {loading
                  ? "Starting Call..."
                  : "Start AI Screening"}

              </Button>


              {/* Call Status */}

              {status && (

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">

                  <div className="flex items-center justify-between gap-3">

                    <span className="text-sm font-medium text-blue-950">
                      Call Status
                    </span>

                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {status}
                    </Badge>

                  </div>


                  {callId && (

                    <p className="mt-2 break-all text-xs text-blue-900/50">
                      Call ID: {callId}
                    </p>

                  )}

                </div>

              )}


              {/* Error */}

              {error && (

                <div className="rounded-lg border border-red-200 bg-red-50 p-3">

                  <p className="text-sm text-red-700">
                    {error}
                  </p>

                </div>

              )}

            </CardContent>

          </Card>


          {/* ==================================================
              RIGHT SIDE — SCREENING RESULT
          ================================================== */}

          <Card className="border-blue-100 bg-white shadow-sm">

            <CardHeader>

              <CardTitle className="text-blue-950">
                Screening Result
              </CardTitle>

              <CardDescription>
                Structured candidate insights from the completed
                AI screening call.
              </CardDescription>

            </CardHeader>


            <CardContent>

              {/* No call yet */}

              {!callId && (

                <div className="flex min-h-[450px] items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/30">

                  <div className="max-w-sm px-6 text-center">

                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl text-blue-700">
                      ☎
                    </div>

                    <p className="font-medium text-blue-950">
                      No screening completed yet
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Start an AI screening call to view
                      qualification, interest, skills match,
                      notice period and recruiter summary.
                    </p>

                  </div>

                </div>

              )}


              {/* Call running */}

              {callId &&
                status !== "COMPLETED" && (

                  <div className="flex min-h-[450px] items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/30">

                    <div className="max-w-sm px-6 text-center">

                      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                      <p className="font-medium text-blue-950">
                        Screening in progress
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Current status:
                      </p>

                      <Badge className="mt-2 bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {status}
                      </Badge>

                      <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        The call status is checked automatically.
                        Results will appear when the screening is
                        completed.
                      </p>

                    </div>

                  </div>

                )}


              {/* Call completed but result processing */}

              {status === "COMPLETED" &&
                !result && (

                  <div className="flex min-h-[450px] items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/30">

                    <div className="max-w-sm px-6 text-center">

                      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                      <p className="font-medium text-blue-950">
                        Processing screening results
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        The call has completed. The structured
                        candidate insights are being prepared.
                      </p>

                    </div>

                  </div>

                )}


              {/* ==================================================
                  COMPLETED RESULT
              ================================================== */}

              {status === "COMPLETED" &&
                result && (

                  <div className="space-y-5">

                    {/* Result header */}

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-sm text-muted-foreground">
                          Candidate
                        </p>

                        <p className="font-semibold text-blue-950">
                          {candidateName}
                        </p>

                      </div>

                      <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                        Screening Complete
                      </Badge>

                    </div>


                    {/* Qualified + Interested */}

                    <div className="grid grid-cols-2 gap-4">

                      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">

                        <p className="text-sm text-blue-900/60">
                          Qualified
                        </p>

                        <p className="mt-1 text-xl font-semibold text-blue-950">
                          {formatBoolean(
                            result.qualified
                          )}
                        </p>

                      </div>


                      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">

                        <p className="text-sm text-blue-900/60">
                          Interested
                        </p>

                        <p className="mt-1 text-xl font-semibold text-blue-950">
                          {formatBoolean(
                            result.interested
                          )}
                        </p>

                      </div>

                    </div>


                    {/* Skills Match */}

                    <div className="rounded-lg border border-blue-100 p-4">

                      <p className="text-sm font-medium text-blue-950">
                        Skills Match
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {result.skills_match ||
                          "Not available"}
                      </p>

                    </div>


                    {/* Notice + Salary */}

                    <div className="grid gap-4 sm:grid-cols-2">

                      <div className="rounded-lg border border-blue-100 p-4">

                        <p className="text-sm font-medium text-blue-950">
                          Notice Period
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {result.notice_period ||
                            "Not available"}
                        </p>

                      </div>


                      <div className="rounded-lg border border-blue-100 p-4">

                        <p className="text-sm font-medium text-blue-950">
                          Expected Salary
                        </p>

                        <p className="mt-2 text-sm text-muted-foreground">
                          {result.expected_salary ||
                            "Not available"}
                        </p>

                      </div>

                    </div>


                    {/* Experience */}

                    <div className="rounded-lg border border-blue-100 p-4">

                      <p className="text-sm font-medium text-blue-950">
                        Relevant Experience
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {result.relevant_experience ||
                          "Not available"}
                      </p>

                    </div>


                    {/* Availability */}

                    <div className="rounded-lg border border-blue-100 p-4">

                      <p className="text-sm font-medium text-blue-950">
                        Interview Availability
                      </p>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {result.interview_availability ||
                          "Not available"}
                      </p>

                    </div>


                    {/* Recruiter Summary */}

                    <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-5">

                      <p className="text-sm font-semibold text-blue-950">
                        Recruiter Summary
                      </p>

                      <p className="mt-2 text-sm leading-6 text-blue-950/70">
                        {result.recruiter_summary ||
                          "Not available"}
                      </p>

                    </div>


                    {/* Call metadata */}

                    <div className="flex flex-wrap gap-2">

                      {callDetails?.duration_seconds !==
                        undefined && (

                        <Badge
                          variant="outline"
                          className="border-blue-200 text-blue-700"
                        >
                          Duration:{" "}
                          {callDetails.duration_seconds}s
                        </Badge>

                      )}


                      {callDetails?.engagement_status && (

                        <Badge
                          variant="outline"
                          className="border-blue-200 text-blue-700"
                        >
                          {
                            callDetails.engagement_status
                          }
                        </Badge>

                      )}


                      {callDetails?.answered_by && (

                        <Badge
                          variant="outline"
                          className="border-blue-200 text-blue-700"
                        >
                          Answered by:{" "}
                          {callDetails.answered_by}
                        </Badge>

                      )}

                    </div>


                    {/* Recording */}

                    {callDetails?.recording_url && (

                      <Button
                        variant="outline"
                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                        onClick={() =>
                          window.open(
                            callDetails.recording_url,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        Listen to Call Recording
                      </Button>

                    )}

                  </div>

                )}

            </CardContent>

          </Card>

        </div>

      </div>

    </main>
  );
}