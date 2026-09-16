import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
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
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
