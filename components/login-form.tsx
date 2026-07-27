"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Loader2, LogIn, Lock, User, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { login } from "@/lib/actions/auth";

interface LoginFormProps {
  from?: string;
}

export function LoginForm({ from }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(login, undefined);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-8">
      {/* Main Container */}
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Logo className="size-6 text-primary" />
          </div>
          
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Central de Tarefas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesse sua conta para continuar
          </p>
        </div>

        <form action={formAction} className="mt-10 flex flex-col gap-6">
          <input type="hidden" name="from" value={from ?? "/"} />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Seu nome de usuário"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Sua senha secreta"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
        </form>



        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ainda não tem conta?{' '}
          <a href="/register" className="font-semibold text-primary hover:underline">
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}
