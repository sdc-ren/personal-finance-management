"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { DEFAULT_QUICK_PRESETS } from "@/lib/quick-presets";
import type { QuickPreset } from "@prisma/client";

export type QuickPresetWithCategory = QuickPreset & {
  category: { id: string; name: string };
};

async function getUserOrThrow() {
  const user = await getAuthenticatedUser();
  return user;
}

/** Danh mục mà user được phép dùng (mặc định hệ thống + của gia đình). */
async function resolveAccessibleCategory(userId: string, categoryId: string) {
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { familyId: true },
  });
  if (!userRecord) return null;

  const conditions: { isDefault?: boolean; familyId?: string }[] = [{ isDefault: true }];
  if (userRecord.familyId) conditions.push({ familyId: userRecord.familyId });

  return prisma.category.findFirst({
    where: { id: categoryId, OR: conditions },
    select: { id: true, name: true, type: true },
  });
}

async function ensureDefaultPresets(userId: string) {
  const defaults = await prisma.category.findMany({
    where: { isDefault: true },
    select: { id: true, name: true, type: true },
  });
  const byName = new Map(defaults.map((c) => [`${c.name}__${c.type}`, c]));

  const toCreate = DEFAULT_QUICK_PRESETS.map((p, i) => {
    const cat = byName.get(`${p.categoryName}__${p.type}`);
    if (!cat) return null;
    return {
      label: p.label,
      type: p.type,
      categoryId: cat.id,
      icon: p.icon,
      sortOrder: i,
      userId,
    };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  if (toCreate.length) {
    await prisma.quickPreset.createMany({ data: toCreate });
  }
}

export async function getQuickPresets(): Promise<QuickPresetWithCategory[]> {
  const user = await getUserOrThrow();

  let presets = await prisma.quickPreset.findMany({
    where: { userId: user.id },
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  // User cũ chưa có preset nào -> tự dựng bộ mặc định từ danh mục hệ thống
  if (presets.length === 0) {
    await ensureDefaultPresets(user.id);
    presets = await prisma.quickPreset.findMany({
      where: { userId: user.id },
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  return presets;
}

export async function createQuickPreset(data: {
  label: string;
  type: "EXPENSE" | "INCOME";
  categoryId: string;
  paymentMethod?: "CASH" | "TRANSFER";
  icon?: string;
}) {
  const user = await getUserOrThrow();
  const label = data.label.trim();
  if (!label) return { error: "Thiếu tên nút" };

  const category = await resolveAccessibleCategory(user.id, data.categoryId);
  if (!category) return { error: "Danh mục không hợp lệ" };
  if (category.type !== data.type) return { error: "Danh mục không khớp loại tiền ra/vào" };

  const count = await prisma.quickPreset.count({ where: { userId: user.id } });
  const preset = await prisma.quickPreset.create({
    data: {
      label: label.slice(0, 30),
      type: data.type,
      categoryId: category.id,
      paymentMethod: data.paymentMethod || "CASH",
      icon: data.icon || "zap",
      sortOrder: count,
      userId: user.id,
    },
  });

  revalidatePath("/settings");
  return { success: true, data: preset };
}

export async function updateQuickPreset(
  id: string,
  data: Partial<{
    label: string;
    type: "EXPENSE" | "INCOME";
    categoryId: string;
    paymentMethod: "CASH" | "TRANSFER";
    icon: string;
    sortOrder: number;
  }>
) {
  const user = await getUserOrThrow();
  const existing = await prisma.quickPreset.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: "Không tìm thấy nút" };

  if (data.categoryId) {
    const category = await resolveAccessibleCategory(user.id, data.categoryId);
    if (!category) return { error: "Danh mục không hợp lệ" };
    const type = data.type || existing.type;
    if (category.type !== type) return { error: "Danh mục không khớp loại tiền ra/vào" };
  }

  const updateData: Record<string, unknown> = {};
  if (data.label !== undefined) updateData.label = data.label.trim().slice(0, 30);
  if (data.type !== undefined) updateData.type = data.type;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  const preset = await prisma.quickPreset.update({ where: { id }, data: updateData });
  revalidatePath("/settings");
  return { success: true, data: preset };
}

export async function deleteQuickPreset(id: string) {
  const user = await getUserOrThrow();
  const existing = await prisma.quickPreset.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: "Không tìm thấy nút" };

  await prisma.quickPreset.delete({ where: { id } });
  revalidatePath("/settings");
  return { success: true };
}
