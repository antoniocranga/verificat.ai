"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateReportStatus(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("reports")
    .update({
      status,
      handled_by: user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    action: "report.update_status",
    payload: { report_id: id, new_status: status },
  });

  revalidatePath("/admin/reports");
}
