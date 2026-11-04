import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin/auth";
import { signIn } from "../actions";
import { inputClass, labelClass } from "../ui";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminUser()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form action={signIn} className="w-full max-w-sm space-y-5 border border-border bg-surface p-8">
        <h1 className="font-serif text-xl text-text">DMC FUJI 管理画面</h1>
        {error && (
          <p role="status" className="bg-text p-3 text-sm text-background">
            メールアドレスかパスワードが違います。
          </p>
        )}
        <div>
          <label htmlFor="email" className={labelClass}>
            メールアドレス
          </label>
          <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            パスワード
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
        </div>
        <button type="submit" className="btn-primary w-full">
          ログイン
        </button>
      </form>
    </main>
  );
}
