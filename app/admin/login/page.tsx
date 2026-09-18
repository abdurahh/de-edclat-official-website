import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 pt-28 pb-16">
      <div className="w-full max-w-lg rounded-[2rem] border border-ruby/10 bg-white/60 px-8 py-12 shadow-soft backdrop-blur-xl">
        <p className="caps-label caps-28 text-xs font-semibold uppercase text-ruby">
          Admin
        </p>
        <h1 className="mt-4 font-display text-4xl text-charcoal">Sign in</h1>
        <p className="mt-3 text-sm leading-7 text-slate">
          Only authorized administrators can manage the catalog.
        </p>
        {error === "reset-link" ? (
          <p className="mt-4 text-sm leading-7 text-ruby">
            That reset link is invalid or expired. Sign in below, or request a
            new reset email after the live site URL is configured.
          </p>
        ) : null}
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
