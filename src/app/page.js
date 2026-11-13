"use client";

import { useState } from "react";
import { sections } from "./data/questions";
import { getSupabase } from "./lib/supabase";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200";
const labelClass = "mb-2 block text-sm font-semibold text-slate-900";

function QuestionField({ question, number }) {
  const id = `question-${question.name}`;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {number}. {question.label}{" "}
        {question.required && <span className="text-red-600">*</span>}
      </label>
      {question.type === "select" ? (
        <select
          id={id}
          name={question.name}
          required={question.required}
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Select an option
          </option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : question.type === "textarea" ? (
        <textarea
          id={id}
          name={question.name}
          rows={4}
          maxLength={2000}
          placeholder={question.placeholder}
          required={question.required}
          className={inputClass}
        />
      ) : (
        <input
          id={id}
          name={question.name}
          type={question.type}
          min={question.min}
          max={question.max}
          maxLength={question.type === "number" ? undefined : 255}
          placeholder={question.placeholder}
          required={question.required}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setErrorMessage("");
    setSubmitting(true);

    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const payload = {
      full_name: String(values.full_name || "").trim(),
      age: Number(values.age),
      gender: values.gender,
      email: String(values.email || "").trim(),
      phone: String(values.phone || "").trim(),
      district: String(values.district || "").trim(),
      qualification: values.qualification,
      university: String(values.university || "").trim(),
      department: String(values.department || "").trim(),
      academic_year: values.academic_year,
      occupation: values.occupation,
      feedback: String(values.feedback || "").trim() || null,
      consented: values.consented === "on",
    };

    try {
      if (!payload.consented)
        throw new Error("Please agree to the consent statement.");
      const { error } = await getSupabase()
        .from("survey_responses")
        .insert(payload);
      if (error) throw error;
      setSubmitted(true); // Only show success after database confirms the insert.
    } catch (error) {
      setErrorMessage(
        error.message || "Could not save your response. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-5xl font-bold text-green-700">✓</div>
          <h1 className="text-2xl font-bold text-slate-900">Thank You!</h1>
          <p className="mt-3 text-slate-700">
            Your response has been saved successfully.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-6 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Submit Another Response
          </button>
        </div>
      </main>
    );
  }

  let questionNumber = 0;
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-xs font-bold tracking-widest text-blue-800">
            ONLINE SURVEY
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            Student Information Survey
          </h1>
          <p className="mt-3 text-slate-700">
            Please complete the 12 fixed questions below.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          {sections.map((section, index) => (
            <section
              key={section.id}
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="mb-6">
                <p className="text-sm font-bold text-blue-700">
                  SECTION {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {section.subtitle}
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {section.questions.map((question) => {
                  questionNumber += 1;
                  return (
                    <div
                      key={question.name}
                      className={
                        question.type === "textarea" ? "md:col-span-2" : ""
                      }
                    >
                      <QuestionField
                        question={question}
                        number={questionNumber}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="flex items-start gap-3 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                name="consented"
                required
                className="mt-1 h-4 w-4 accent-blue-700"
              />
              <span>
                I agree to submit my information for this survey. Only
                authorized administrators can review the answers.
              </span>
            </label>
            <div className="mt-5 flex flex-col items-stretch justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-700">
                <span className="text-red-600">*</span> Required questions
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-700 px-8 py-3 font-bold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Survey →"}
              </button>
            </div>
            {errorMessage && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800"
              >
                {errorMessage}
              </p>
            )}
          </div>
        </form>

        <footer className="mt-8 text-center text-sm text-slate-600">
          © 2026 Rafiul Goni Rayhan | BU CSE. All Rights Reserved.
        </footer>
      </div>
    </main>
  );
}
