"use client";

import { useEffect } from "react";

export function PwaInstaller() {
  useEffect(() => {
    // 1. Registra o Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registrado com sucesso:", reg.scope))
          .catch((err) => console.error("Erro ao registrar o Service Worker:", err));
      });
    }

    // 2. Captura o prompt de instalação e despacha um evento personalizado
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Salva o evento no objeto window para que o botão de PWA possa acessá-lo
      (window as any).deferredPrompt = e;
      // Despacha um evento customizado indicando que o PWA está pronto para instalação
      window.dispatchEvent(new CustomEvent("pwa-install-ready"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
