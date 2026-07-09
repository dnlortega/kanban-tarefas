"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function PwaInstallButton() {
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    // Se já estiver rodando como standalone (instalado), não mostra o botão
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      return;
    }

    // Se o evento already fired e foi salvo
    if (typeof window !== "undefined" && (window as any).deferredPrompt) {
      setInstallable(true);
    }

    const handleReady = () => {
      setInstallable(true);
    };

    window.addEventListener("pwa-install-ready", handleReady);
    return () => {
      window.removeEventListener("pwa-install-ready", handleReady);
    };
  }, []);

  const handleInstallClick = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (!deferredPrompt) return;

    // Exibe o prompt de instalação
    deferredPrompt.prompt();

    // Aguarda a resposta do usuário
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Escolha de instalação do usuário: ${outcome}`);

    // Limpa o prompt para que não possa ser reutilizado
    (window as any).deferredPrompt = null;
    setInstallable(false);
  };

  if (!installable) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleInstallClick}
          variant="outline"
          size="sm"
          className="relative h-8 gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary-foreground dark:border-primary/40 dark:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-300"
        >
          <span className="absolute -inset-px -z-10 rounded-lg bg-primary/20 opacity-0 blur-sm transition-opacity group-hover:opacity-100 animate-pulse" />
          <Download className="size-3.5 animate-bounce" style={{ animationDuration: "2s" }} />
          <span className="hidden text-xs font-semibold sm:inline">Instalar App</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Instalar aplicativo Kanban no seu dispositivo</TooltipContent>
    </Tooltip>
  );
}
