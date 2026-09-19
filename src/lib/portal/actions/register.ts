"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  registerListerErrorMessages,
  registerListerFromForm,
  type RegisterListerErrorCode,
} from "@/lib/portal/register-lister-core";

export type RegisterState = { error?: string } | null;

/** @deprecated Prefer POST /api/portal/register — stable across deploys. */
export async function registerLister(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const result = await registerListerFromForm(formData, await headers());

  if (!result.ok) {
    return {
      error: registerListerErrorMessages[result.code as RegisterListerErrorCode],
    };
  }

  redirect(
    `/portal/register/success?email=${encodeURIComponent(result.email)}`,
  );
}
