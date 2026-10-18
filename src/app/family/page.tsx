import { redirect } from "next/navigation";

/** Gia đình đã chuyển vào Cài đặt — giữ redirect cho link cũ/bookmark. */
export default function FamilyRedirectPage() {
  redirect("/settings?tab=family");
}
