"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Date de autentificare invalide.";
  if (message.includes("User already registered"))
    return "Acest email este deja înregistrat.";
  if (message.includes("Password should be at least"))
    return "Parola trebuie să conțină cel puțin 6 caractere.";
  if (message.includes("Email not confirmed"))
    return "Adresa de email nu a fost confirmată.";
  if (message.includes("User not found"))
    return "Utilizatorul nu a fost găsit.";
  if (message.includes("Signup requires a valid password"))
    return "Este necesară o parolă validă.";
  if (message.includes("To signup, please provide your email"))
    return "Vă rugăm să introduceți adresa de email.";
  return message;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(
      `/login?error=${encodeURIComponent(translateAuthError(error.message))}`,
    );
  }

  revalidatePath("/", "layout");
  return redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://staging.verificat.xyz"}/auth/callback`,
    },
  });

  if (error) {
    return redirect(
      `/login?error=${encodeURIComponent(translateAuthError(error.message))}`,
    );
  }

  return redirect(
    `/login?message=${encodeURIComponent("Cont creat cu succes! Vă rugăm să verificați email-ul pentru a confirma.")}`,
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://staging.verificat.xyz"}/auth/callback?next=/update-password`,
  });

  if (error) {
    return redirect(
      `/reset-password?error=${encodeURIComponent(translateAuthError(error.message))}`,
    );
  }

  return redirect(
    `/reset-password?message=${encodeURIComponent("Link-ul de resetare a fost trimis! Verificați email-ul.")}`,
  );
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return redirect(
      `/update-password?error=${encodeURIComponent(translateAuthError(error.message))}`,
    );
  }

  return redirect(
    `/dashboard?message=${encodeURIComponent("Parola a fost actualizată cu succes!")}`,
  );
}

export async function signInWithProvider(provider: "google" | "github") {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://staging.verificat.xyz"}/auth/callback`,
    },
  });

  if (error) {
    return redirect(
      `/login?error=${encodeURIComponent(translateAuthError(error.message))}`,
    );
  }

  if (data?.url) {
    return redirect(data.url);
  }
}
