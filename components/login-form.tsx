"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Logo } from "@/components/logo";
import { login } from "@/lib/actions/auth";

interface LoginFormProps {
  from?: string;
}

export function LoginForm({ from }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.16),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.22),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,var(--background)_85%)]"
      />

      <Card className="w-full max-w-sm border-none py-8 shadow-2xl ring-1 ring-foreground/10">
        <CardHeader className="items-center gap-1 text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-2xl bg-[#6366f1]/10 ring-1 ring-[#6366f1]/20">
            <Logo className="size-9" />
          </div>
          <CardTitle className="text-xl">Central de Tarefas &amp; Jukebox</CardTitle>
          <CardDescription>Entre com seu usuário e senha para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="from" value={from ?? "/"} />

            <div className="grid gap-1.5">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoFocus
                  required
                  autoComplete="username"
                  className="h-10 pl-9"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="h-10 pl-9"
                />
              </div>
            </div>

            {state?.error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  className="mt-1 size-11 self-center"
                  aria-label="Entrar"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Entrar</TooltipContent>
            </Tooltip>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
