import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("admin_session", "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
