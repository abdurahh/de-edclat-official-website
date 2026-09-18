import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";

export default function AdminResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 pt-28 pb-16">
      <div className="w-full max-w-lg rounded-[2rem] border border-ruby/10 bg-white/60 px-8 py-12 shadow-soft backdrop-blur-xl">
        <p className="caps-label caps-28 text-xs font-semibold uppercase text-ruby">
          Admin
        </p>
        <h1 className="mt-4 font-display text-4xl text-charcoal">
          Set a new password
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate">
          Choose a password for the catalog admin. You’ll use this the next time
          you sign in.
        </p>
        <div className="mt-8">
          <AdminResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
