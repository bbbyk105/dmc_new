import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { isAdminEmail } from "./allowlist";

/** 管理画面のログインに使う Supabase（予約・注文と同じプロジェクト） */
export function authConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase の URL と anon key を設定してください");
  return { url, key };
}

/** Cookie にログインを持つ Supabase（Server Component・Server Action から使う） */
export async function authClient() {
  const store = await cookies();
  const { url, key } = authConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Component からは Cookie を書けない。トークンの更新は proxy.ts が行う
        }
      },
    },
  });
}

/** ログインしていて、ADMIN_EMAILS にあるアドレスなら、そのユーザー */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await authClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  return user && isAdminEmail(user.email, process.env.ADMIN_EMAILS) ? user : null;
}

/**
 * 管理画面のページと Server Action の最初に呼ぶ。入れない人はログインへ送る。
 * Server Action は画面とは別に呼べるので、レイアウトで確かめていても、それぞれで呼ぶ
 */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
