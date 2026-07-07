"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <style>{`
          :root { color-scheme: light dark; }
          body {
            margin: 0;
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
            background: #fafafa;
            color: #18181b;
          }
          @media (prefers-color-scheme: dark) {
            body { background: #0a0a0b; color: #fafafa; }
            .ge-card { background: #18181b !important; border-color: #27272a !important; }
            .ge-desc { color: #a1a1aa !important; }
            .ge-btn { background: #6366f1 !important; color: #fff !important; }
          }
          .ge-wrap {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
          }
          .ge-card {
            width: 100%;
            max-width: 24rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            text-align: center;
            padding: 2.5rem 2rem;
            border-radius: 1rem;
            border: 1px solid #e4e4e7;
            background: #ffffff;
            box-shadow: 0 20px 40px -20px rgba(0,0,0,0.25);
          }
          .ge-logo {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: #6366f1;
          }
          .ge-title { font-size: 1.125rem; font-weight: 600; margin: 0; }
          .ge-desc { margin: 0; font-size: 0.875rem; color: #71717a; }
          .ge-btn {
            appearance: none;
            border: none;
            border-radius: 0.5rem;
            padding: 0.5rem 1.25rem;
            font-size: 0.875rem;
            font-weight: 500;
            background: #6366f1;
            color: #fff;
            cursor: pointer;
          }
          .ge-btn:hover { opacity: 0.9; }
        `}</style>
        <div className="ge-wrap">
          <div className="ge-card">
            <div className="ge-logo" />
            <div>
              <p className="ge-title">Algo deu errado</p>
              <p className="ge-desc">
                Ocorreu um erro inesperado no aplicativo. Tente novamente.
              </p>
            </div>
            <button type="button" className="ge-btn" onClick={reset}>
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
