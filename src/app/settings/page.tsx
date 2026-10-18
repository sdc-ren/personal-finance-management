import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategories } from "@/actions/transaction";
import { getBudgetProgress } from "@/actions/budget";
import { getSystemCategories } from "@/actions/admin";
import { getQuickPresets } from "@/actions/quick-preset";
import { getFamily } from "@/actions/family";
import { FamilyManagement } from "@/components/family/family-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCard } from "@/components/ui/finance";
import { BudgetList } from "@/components/budget/budget-list";
import { CategoryClient } from "@/components/admin/category-client";
import { QuickPresetManager } from "@/components/settings/quick-preset-manager";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { TAB_LIST, TAB_TRIGGER } from "@/lib/tab-styles";
import { cn } from "@/lib/utils";
import { Page, PageHeader } from "@/components/ui/page";

const TAB_LIST_CLASS = cn(TAB_LIST, "w-full overflow-x-auto sm:w-auto");

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  const [categories, budgetProgress, systemCategories, quickPresets, family] = await Promise.all([
    getCategories(),
    getBudgetProgress(),
    isAdmin ? getSystemCategories() : Promise.resolve([]),
    getQuickPresets(),
    getFamily(),
  ]);

  const resolvedSearchParams = await searchParams;
  const defaultTab = (resolvedSearchParams.tab as string) || "budget";

  const accountRows = [
    { label: "Tên hiển thị", value: session.user?.name || "Chưa cập nhật" },
    { label: "Email", value: session.user?.email || "Chưa cập nhật" },
    { label: "Vai trò", value: session.user?.role || "—" },
  ];

  return (
    <WorkspaceLayout withPanel={false}>
      <Page>
        <PageHeader
          title="Cài đặt"
          description="Quản lý ngân sách, nút ghi nhanh, gia đình, danh mục và tài khoản."
        />
        <Tabs defaultValue={defaultTab} className="flex flex-col gap-4">
        <TabsList className={TAB_LIST_CLASS}>
          <TabsTrigger value="general" className={TAB_TRIGGER}>
            Thông tin chung
          </TabsTrigger>
          <TabsTrigger value="budget" className={TAB_TRIGGER}>
            Ngân sách
          </TabsTrigger>
          <TabsTrigger value="quick-add" className={TAB_TRIGGER}>
            Nút ghi nhanh
          </TabsTrigger>
          <TabsTrigger value="family" className={TAB_TRIGGER}>
            Gia đình
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="categories" className={TAB_TRIGGER}>
              Danh mục hệ thống (Admin)
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <SectionCard title="Thông tin tài khoản">
            <p className="text-sm text-muted-foreground">Thông tin cá nhân và bảo mật</p>
            <dl className="mt-2 divide-y divide-border">
              {accountRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <dt className="shrink-0 text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 break-all text-right text-sm font-medium text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              Hiện tại bạn chưa thể thay đổi thông tin này trực tiếp.
            </p>
          </SectionCard>
        </TabsContent>

        <TabsContent value="budget">
          <BudgetList initialBudgets={budgetProgress} categories={categories} />
        </TabsContent>

        <TabsContent value="quick-add">
          <SectionCard title="Nút ghi nhanh">
            <QuickPresetManager categories={categories} initialPresets={quickPresets} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="family">
          <FamilyManagement initialFamily={family} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="categories">
            <SectionCard title="Quản lý danh mục hệ thống">
              <p className="text-sm text-muted-foreground">
                Thêm, sửa, xóa các danh mục mặc định của hệ thống.
              </p>
              <CategoryClient categories={systemCategories} />
            </SectionCard>
          </TabsContent>
        )}
        </Tabs>
      </Page>
    </WorkspaceLayout>
  );
}
