export function getApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    if (window.location.hostname === "staging.verificat.xyz") {
      return "https://api-staging.verificat.xyz";
    }
    if (window.location.hostname === "verificat.xyz") {
      return "https://api.verificat.xyz";
    }
  }
  return "http://localhost:3000";
}
