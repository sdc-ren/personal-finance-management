import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategories } from "@/actions/transaction";
import { getBudgetProgress } from "@/actions/budget";
import { getSystemCategories } from "@/actions/admin";
import { getQuickPresets } from "@/actions/quick-preset";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel, SteelGrid, Readout } from "@/components/ui/panel";
import { BudgetList } from "@/components/budget/budget-list";
import { CategoryClient } from "@/components/admin/category-client";
import { QuickPresetManager } from "@/components/settings/quick-preset-manager";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { TAB_LIST, TAB_TRIGGER } from "@/lib/tab-styles";
import { cn } from "@/lib/utils";

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

  const [categories, budgetProgress, systemCategories, quickPresets] = await Promise.all([
    getCategories(),
    getBudgetProgress(),
    isAdmin ? getSystemCategories() : Promise.resolve([]),
    getQuickPresets(),
  ]);

  const resolvedSearchParams = await searchParams;
  const defaultTab = (resolvedSearchParams.tab as string) || "budget";

  return (
    <WorkspaceLayout withPanel={false}>
      <Tabs defaultValue={defaultTab} className="gap-4">
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
          {isAdmin && (
            <TabsTrigger value="categories" className={TAB_TRIGGER}>
              Danh mục hệ thống (Admin)
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general">
          <Panel plaque="Thông tin tài khoản" className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">Thông tin cá nhân và bảo mật</p>
            <SteelGrid className="mt-4 grid-cols-1 sm:grid-cols-3">
              <Readout label="Tên hiển thị" wrap>{session.user?.name || "Chưa cập nhật"}</Readout>
              <Readout label="Email" wrap>{session.user?.email}</Readout>
              <Readout label="Vai trò" wrap>{session.user?.role}</Readout>
            </SteelGrid>
            <p className="mt-4 text-xs text-muted-foreground">
              Hiện tại bạn chưa thể thay đổi thông tin này trực tiếp.
            </p>
          </Panel>
        </TabsContent>

        <TabsContent value="budget">
          <BudgetList initialBudgets={budgetProgress} categories={categories} />
        </TabsContent>

        <TabsContent value="quick-add">
          <Panel plaque="Nút ghi nhanh" className="p-4 sm:p-5">
            <QuickPresetManager categories={categories} initialPresets={quickPresets} />
          </Panel>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="categories">
            <Panel plaque="Quản lý danh mục hệ thống" className="p-4 sm:p-5">
              <p className="text-sm text-muted-foreground">
                Thêm, sửa, xóa các danh mục mặc định của hệ thống.
              </p>
              <CategoryClient categories={systemCategories} />
            </Panel>
          </TabsContent>
        )}
      </Tabs>
    </WorkspaceLayout>
  );
}
