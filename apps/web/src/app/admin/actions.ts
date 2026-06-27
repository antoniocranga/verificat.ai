"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addSource(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const trustScore = formData.get("trust_score") as string;

  const { error } = await supabase.from("sources").insert({
    name,
    url,
    trust_score: trustScore ? parseInt(trustScore, 10) : null,
  });

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    action: "source.create",
    payload: { name, url },
  });

  revalidatePath("/admin/sources");
}

export async function updateSource(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const trustScore = formData.get("trust_score") as string;

  const { error } = await supabase
    .from("sources")
    .update({
      name,
      url,
      trust_score: trustScore ? parseInt(trustScore, 10) : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    action: "source.update",
    payload: { source_id: id, name, url },
  });

  revalidatePath("/admin/sources");
}

export async function deleteSource(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("sources").delete().eq("id", id);

  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    action: "source.delete",
    payload: { source_id: id },
  });

  revalidatePath("/admin/sources");
}
