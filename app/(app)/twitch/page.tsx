import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { TwitchExplorer } from "@/components/twitch/twitch-explorer";

export const dynamic = "force-dynamic";

export default function TwitchPage() {
  const configured = Boolean(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 sm:p-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Twitch</h1>
          <p className="text-sm text-muted-foreground">
            Busque um canal, veja se está ao vivo e assista direto aqui.
          </p>
        </div>

        {configured ? (
          <TwitchExplorer />
        ) : (
          <Card>
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-muted-foreground">
                As credenciais da Twitch (<code>TWITCH_CLIENT_ID</code> /{" "}
                <code>TWITCH_CLIENT_SECRET</code>) ainda não foram configuradas. Veja{" "}
                <code>docs/twitch-api-key.md</code> para o passo a passo.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
