import type { APIRoute } from "astro";
import { createBooking } from "../../lib/db";

function withQuery(path: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
}

// A plain HTML form POSTs here and follows the 303 redirect back — the core
// booking flow needs no client-side JavaScript. Either way it redirects back
// to the room list on the same date, with an `error` the page reads and
// displays next to the room on failure.
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const roomId = Number(form.get("roomId"));
  const date = String(form.get("date") ?? "").trim();
  const startTime = String(form.get("startTime") ?? "").trim();
  const endTime = String(form.get("endTime") ?? "").trim();
  const studentId = String(form.get("studentId") ?? "").trim();

  if (!roomId || !date || !startTime || !endTime || !studentId) {
    return redirect(withQuery("/", { date, error: "invalid" }), 303);
  }

  const result = createBooking({ roomId, date, startTime, endTime, studentId });
  if (!result.ok) {
    return redirect(withQuery("/", { date, error: result.error }), 303);
  }

  return redirect(withQuery("/", { date }), 303);
};
