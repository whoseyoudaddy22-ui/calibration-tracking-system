import { auth, signOut } from "@/auth";

export async function AuthStatus() {
  const session = await auth();

  if (!session?.user) {
    return (
      <a
        href="/login"
        className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        เข้าสู่ระบบ
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>
        {session.user.name} ({session.user.role})
      </span>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button
          type="submit"
          className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
        >
          ออกจากระบบ
        </button>
      </form>
    </div>
  );
}
