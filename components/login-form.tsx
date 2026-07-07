"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Logo className="mb-2 size-10" />
          <CardTitle>Central de Tarefas & Jukebox</CardTitle>
          <CardDescription>Digite a senha de acesso para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="from" value={from ?? "/"} />
            <div className="grid gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" autoFocus required />
              {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="submit"
                    size="icon"
                    className="self-center"
                    aria-label="Entrar"
                    disabled={isPending}
                  />
                }
              >
                <LogIn className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Entrar</TooltipContent>
            </Tooltip>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
