"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { allQuestions } from "../data/questions";
import { getSupabase } from "../lib/supabase";

const columns = [
  ["created_at", "Submitted At"],
  ...allQuestions.map((question) => [question.name, question.label]),
];

function csvValue(value) {
  let str = String(value ?? "");
  // Prevent spreadsheet-formula injection when this CSV is opened in Excel.
  if (/^[\s]*[=+\-@]/.test(str)) str = "'" + str;
  return `"${str.replaceAll('"', '""')}"`;
}

function downloadCsv(rows) {
  const lines = [
    columns.map(([, label]) => csvValue(label)).join(","),
    ...rows.map((row) => columns.map(([key]) => csvValue(row[key])).join(",")),
  ];
  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "survey-responses.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DashboardPage() {
  const router = useRouter();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadResponses() {
      try {
        const supabase = getSupabase();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          router.replace("/login");
          return;
        }

        const { data: admin, error: adminError } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", userData.user.id)
          .maybeSingle();
        if (adminError) throw adminError;
        if (!admin) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        // Supabase limits single queries; fetch all rows in batches.
        let all = [];
        let offset = 0;
        const pageSize = 500;
        while (true) {
          const { data, error } = await supabase
            .from("survey_responses")
            .select("*")
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .range(offset, offset + pageSize - 1);
          if (error) throw error;
          all = all.concat(data || []);
          if (!data || data.length < pageSize) break;
          offset += pageSize;
        }
        if (active) setResponses(all);
      } catch (error) {
        if (active) setErrorMessage(error.message || "Could not load responses.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadResponses();
    return () => { active = false; };
  }, [router]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return responses;
    return responses.filter((row) =>
      allQuestions.some(({ name }) => String(row[name] ?? "").toLowerCase().includes(keyword))
    );
  }, [responses, search]);

  if (loading) {
    return <main className="mx-auto max-w-6xl px-4 py-16 text-center font-semibold text-slate-700">Checking admin access and loading responses...</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Admin Area</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Survey Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Only authorized administrators can view the responses.</p>
        </div>
        <button type="button" disabled={!responses.length} onClick={() => downloadCsv(responses)}
          className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
          Download All CSV
        </button>
      </div>

      {errorMessage && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">Total Responses</p>
          <p className="mt-2 text-4xl font-extrabold text-slate-900">{responses.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-600">Surveys</p>
          <p className="mt-2 text-4xl font-extrabold text-slate-900">1</p>
          <p className="mt-1 text-xs text-slate-500">Student Information Survey</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-900">Submitted Responses</h2>
          <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" aria-label="Search survey responses"
            placeholder="Search responses..." className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-blue-600 sm:max-w-xs" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-100 text-slate-800">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Age</th><th className="px-5 py-3">University</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Details</th></tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 text-slate-800">
                  <td className="px-5 py-3 font-semibold">{row.full_name}</td>
                  <td className="px-5 py-3">{row.age}</td>
                  <td className="px-5 py-3">{row.university}</td>
                  <td className="px-5 py-3">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3"><button type="button" onClick={() => setSelected(row)} className="font-bold text-blue-700 hover:underline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="p-8 text-center text-sm text-slate-600">{responses.length ? "No matching responses." : "No responses yet."}</p>}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div role="dialog" aria-modal="true" aria-label="Survey response details" className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Full Response</h2>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-800 hover:bg-slate-200">Close ✕</button>
            </div>
            <dl className="divide-y divide-slate-100">
              <div className="py-3"><dt className="text-xs font-bold text-slate-600">Submitted At</dt><dd className="mt-1 break-words text-slate-900">{new Date(selected.created_at).toLocaleString()}</dd></div>
              {allQuestions.map((question) => (
                <div key={question.name} className="py-3">
                  <dt className="text-xs font-bold text-slate-600">{question.label}</dt>
                  <dd className="mt-1 break-words text-slate-900">{String(selected[question.name] ?? "—")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </main>
  );
}
