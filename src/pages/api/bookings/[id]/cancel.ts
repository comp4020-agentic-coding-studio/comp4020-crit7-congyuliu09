import type { APIRoute } from "astro";
import { cancelBooking } from "../../../../lib/db";

function withQuery(path: string, params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return query ? `${path}?${query}` : path;
}

// Only removes the booking when the posted Student ID matches the one it was
// made under — the same "re-enter your ID" identity My Bookings uses to view
// it in the first place.
export const POST: APIRoute = async ({ params, request, redirect }) => {
  const id = Number(params.id);
  const form = await request.formData();
  const studentId = String(form.get("studentId") ?? "").trim();

  const result = cancelBooking(id, studentId);
  if (!result.ok) {
    return redirect(withQuery("/bookings/", { studentId, error: result.error }), 303);
  }

  return redirect(withQuery("/bookings/", { studentId }), 303);
};
