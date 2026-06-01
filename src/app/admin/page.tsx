import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Admin</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="mt-1 font-medium text-foreground">{session.user.email}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Role: <span className="text-foreground">{session.user.role}</span>
        </p>
        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
