import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", id: "admin-nav-dashboard" },
  { href: "/admin/fact-checks", label: "Fact Checks", id: "admin-nav-fact-checks" },
  { href: "/admin/sources", label: "Surse", id: "admin-nav-sources" },
  { href: "/admin/reports", label: "Rapoarte abuzuri", id: "admin-nav-reports" },
  { href: "/admin/usage", label: "Monitorizare costuri", id: "admin-nav-usage" },
];

const BOTTOM_ITEMS = [
  { href: "/dashboard", label: "Cont utilizator", id: "admin-nav-user-account" },
  { href: "/admin/audit-log", label: "Audit", id: "admin-nav-audit", adminOnly: true },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    return redirect("/dashboard");
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-canvas)",
        display: "flex",
      }}
    >
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        id="admin-sidebar"
        style={{
          width: 240,
          flexShrink: 0,
          background: "var(--color-canvas-elevated)",
          borderRight: "1px solid var(--color-subtle)",
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-6, 24px) 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo — icon only, no wordmark */}
        <div
          style={{
            padding: "0 var(--space-5, 20px) var(--space-6, 24px)",
            borderBottom: "1px solid var(--color-subtle)",
            marginBottom: "var(--space-4, 16px)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3, 12px)",
          }}
        >
          {/* Shield-check SVG inline */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-label="verificat.ai logo"
          >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 13,
              color: "var(--color-mid)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Admin
          </span>
        </div>

        {/* Main nav */}
        <nav aria-label="Navigare admin" style={{ flex: 1, padding: "0 var(--space-3, 12px)" }}>
          {NAV_ITEMS.map((item) => (
            <AdminNavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid var(--color-subtle)",
            margin: "var(--space-4, 16px) 0",
          }}
        />

        {/* Bottom nav */}
        <nav aria-label="Navigare secundară" style={{ padding: "0 var(--space-3, 12px)" }}>
          {BOTTOM_ITEMS.filter(
            (item) => !item.adminOnly || isAdmin
          ).map((item) => (
            <AdminNavLink key={item.href} {...item} />
          ))}

          {/* Role badge */}
          <div
            style={{
              marginTop: "var(--space-4, 16px)",
              padding: "var(--space-3, 12px) var(--space-4, 16px)",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-canvas-inset)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-mid)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Rol
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--color-ink)",
              }}
            >
              {isAdmin ? "Super Admin" : "Moderator"}
            </span>
          </div>
        </nav>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            height: 56,
            borderBottom: "1px solid var(--color-subtle)",
            background: "var(--color-canvas-elevated)",
            padding: "0 var(--space-8, 32px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 15,
              color: "var(--color-ink)",
              letterSpacing: "-0.01em",
            }}
          >
            verificat.ai
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--color-mid)",
            }}
          >
            {user.email}
          </span>
        </header>

        <main style={{ padding: "var(--space-8, 32px)", flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  id,
}: {
  href: string;
  label: string;
  id: string;
}) {
  // We can't use usePathname in a server component, so we use a basic anchor.
  // Active state is applied via client-side script (aria-current) in a real app.
  return (
    <a
      id={id}
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        height: 40,
        padding: "0 var(--space-4, 16px)",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
        color: "var(--color-ink)",
        textDecoration: "none",
        marginBottom: 2,
        transition: "background var(--transition-fast), color var(--transition-fast)",
        borderLeft: "3px solid transparent",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "var(--color-canvas-inset)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </a>
  );
}
