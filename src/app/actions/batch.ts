"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploadFile } from "@/lib/storage";

export type DeleteBatchResult =
  | { status: "ok" }
  | { status: "error"; message: string };

export async function deleteBatch(batchId: string): Promise<DeleteBatchResult> {
  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "Anda harus login sebagai admin." };
  }

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) {
    return { status: "error", message: "Data tidak ditemukan." };
  }

  await prisma.batch.delete({ where: { id: batchId } });
  await deleteUploadFile(batch.filePath);

  revalidatePath("/");
  revalidatePath(`/batch/${batchId}`);

  return { status: "ok" };
}
