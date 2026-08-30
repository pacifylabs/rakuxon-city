"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/auth/dal";
import { getEnquiry } from "@/lib/admin/queries/enquiries";
import { EnquiryStatus } from "@/generated/prisma/enums";

/**
 * Every action re-reads the enquiry through `getEnquiry`, which applies the
 * same track scoping the inbox does. A Server Action is a POST endpoint —
 * reachable directly, not only from the form that renders it — so the check
 * belongs here as well as on the page.
 */
async function assertReachable(enquiryId: string) {
  const user = await verifySession();
  const enquiry = await getEnquiry(user, enquiryId);
  if (!enquiry) throw new Error("Enquiry not found");
  return user;
}

export async function updateEnquiryStatus(formData: FormData): Promise<void> {
  const enquiryId = String(formData.get("enquiryId") ?? "");
  const status = String(formData.get("status") ?? "") as EnquiryStatus;
  if (!Object.values(EnquiryStatus).includes(status)) return;

  await assertReachable(enquiryId);

  await db.enquiry.update({ where: { id: enquiryId }, data: { status } });

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${enquiryId}`);
}

export async function assignEnquiry(formData: FormData): Promise<void> {
  const enquiryId = String(formData.get("enquiryId") ?? "");
  const rawUserId = String(formData.get("assignedToUserId") ?? "");
  // "" is the "Unassigned" option, which is a real choice, not a missing value.
  const assignedToUserId = rawUserId === "" ? null : rawUserId;

  await assertReachable(enquiryId);

  if (assignedToUserId) {
    const target = await db.user.findUnique({
      where: { id: assignedToUserId },
      select: { isActive: true },
    });
    // Assigning to a deactivated account would silently park the enquiry with
    // someone who can no longer sign in to see it.
    if (!target?.isActive) return;
  }

  await db.enquiry.update({
    where: { id: enquiryId },
    data: { assignedToUserId },
  });

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${enquiryId}`);
}

export async function addEnquiryNote(formData: FormData): Promise<void> {
  const enquiryId = String(formData.get("enquiryId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const user = await assertReachable(enquiryId);

  await db.internalNote.create({
    data: { enquiryId, authorUserId: user.id, body },
  });

  revalidatePath(`/admin/enquiries/${enquiryId}`);
}

/* ---------------------------------------------------------------------- */
/* Investor enquiries — separate table, separate permission, no track.     */
/* ---------------------------------------------------------------------- */

async function assertInvestorAccess() {
  const user = await verifySession();
  if (user.role !== "ADMIN" && user.role !== "INVESTOR_MANAGER") {
    throw new Error("Not permitted");
  }
  return user;
}

export async function updateInvestorEnquiryStatus(
  formData: FormData,
): Promise<void> {
  await assertInvestorAccess();

  const id = String(formData.get("enquiryId") ?? "");
  const status = String(formData.get("status") ?? "") as EnquiryStatus;
  if (!Object.values(EnquiryStatus).includes(status)) return;

  await db.investorEnquiry.update({ where: { id }, data: { status } });

  revalidatePath("/admin/investor-enquiries");
  revalidatePath(`/admin/investor-enquiries/${id}`);
}

export async function addInvestorEnquiryNote(
  formData: FormData,
): Promise<void> {
  const user = await assertInvestorAccess();

  const investorEnquiryId = String(formData.get("enquiryId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.internalNote.create({
    data: { investorEnquiryId, authorUserId: user.id, body },
  });

  revalidatePath(`/admin/investor-enquiries/${investorEnquiryId}`);
}
