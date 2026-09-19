import { NextResponse } from "next/server";
import { registerListerFromForm } from "@/lib/portal/register-lister-core";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await registerListerFromForm(formData, request.headers);

  if (!result.ok) {
    const url = new URL("/portal/register", request.url);
    url.searchParams.set("error", result.code);
    return NextResponse.redirect(url, 303);
  }

  const url = new URL("/portal/register/success", request.url);
  url.searchParams.set("email", result.email);
  return NextResponse.redirect(url, 303);
}
