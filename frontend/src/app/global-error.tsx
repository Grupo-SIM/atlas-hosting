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
      <body className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 font-sans">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="mb-2 font-bold text-2xl text-slate-800">
            Algo deu errado!
          </h2>
          <p className="mb-6 text-slate-600">
            Ocorreu um erro crítico. Nossa equipe técnica já foi notificada.
          </p>
          <button
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-blue-700"
            onClick={() => reset()}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
