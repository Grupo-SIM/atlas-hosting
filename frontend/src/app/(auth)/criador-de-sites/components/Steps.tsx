const LABELS = ["Template", "Configurar", "Editar", "Publicar"];

/** Passos do fluxo de criação (1 = Template … 4 = Publicar). */
export function Steps({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="hidden items-center gap-1.5 text-xs md:flex">
      {LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li className="flex items-center gap-1.5" key={label}>
            <span
              className={`flex size-[18px] items-center justify-center rounded-full font-medium text-[10px] ${
                active
                  ? "bg-[#1d1c1a] text-white"
                  : done
                    ? "bg-[#d6f34a] text-[#1d1c1a]"
                    : "bg-[#ece9e2] text-[#9a968e]"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span
              className={
                active ? "font-medium text-[#1d1c1a]" : "text-[#9a968e]"
              }
            >
              {label}
            </span>
            {n < LABELS.length ? (
              <span className="h-px w-[18px] bg-[#d9d6ce]" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
