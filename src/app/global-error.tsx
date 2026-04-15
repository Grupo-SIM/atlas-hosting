"use client";

export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt">
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h2>Algo deu errado!</h2>
          <button type="button" onClick={() => reset()}>Tentar novamente</button>
        </div>
      </body>
    </html>
  );
}
