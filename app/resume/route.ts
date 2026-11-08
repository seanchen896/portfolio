import { NextRequest, NextResponse } from "next/server";
import { publishedSettings } from "@/lib/published-content";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const { resume } = await publishedSettings();
  return NextResponse.redirect(new URL(resume.src, request.url), { headers: { "Cache-Control": "no-store" } });
}
