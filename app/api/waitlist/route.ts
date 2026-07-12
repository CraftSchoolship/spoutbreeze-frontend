import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const WAITLIST_FILE = path.join(process.cwd(), "data", "waitlist.json");

export async function POST(req: NextRequest) {
  let email: string | null = null;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    email = typeof body?.email === "string" ? body.email : null;
  } else {
    const form = await req.formData().catch(() => null);
    const value = form?.get("email");
    email = typeof value === "string" ? value : null;
  }

  email = email?.trim() ?? null;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  try {
    await fs.mkdir(path.dirname(WAITLIST_FILE), { recursive: true });
    let entries: Array<{ email: string; joinedAt: string }> = [];
    try {
      const existing = JSON.parse(await fs.readFile(WAITLIST_FILE, "utf8"));
      if (Array.isArray(existing)) entries = existing;
    } catch {
      // Missing or malformed file — start a fresh list.
    }
    entries.push({ email, joinedAt: new Date().toISOString() });
    await fs.writeFile(WAITLIST_FILE, JSON.stringify(entries, null, 2));
  } catch (err) {
    // Read-only filesystem (e.g. some hosts) — keep the signup observable in logs.
    console.log("waitlist signup:", email, err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
