import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  AuthNoticeToast,
  type AuthNotice,
} from "@/components/auth/AuthNoticeToast";

export const metadata: Metadata = {
  title: "Entrar | Orari",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { loggedOut, expired } = await searchParams;
  const notice: AuthNotice | null = loggedOut
    ? "loggedOut"
    : expired
      ? "expired"
      : null;

  return (
    <div className="w-full max-w-sm">
      {notice && <AuthNoticeToast notice={notice} />}
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold">Entrar no Orari</h1>
        <p className="text-sm text-muted-foreground">
          Acesse os agendamentos da sua empresa.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
