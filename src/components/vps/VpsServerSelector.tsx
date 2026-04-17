"use client";

import { useRouter } from "next/navigation";

interface Server {
  id: string;
  name: string;
  ip: string;
}

export default function VpsServerSelector({ 
  servers, 
  currentId 
}: { 
  servers: Server[], 
  currentId: string 
}) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    // Redireciona para a mesma página com o novo ID na URL
    router.push(`/manage/vps?id=${id}`);
  };

  return (
    <div className="w-[240px]">
      <select 
        defaultValue={currentId}
        onChange={handleChange}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {servers.map(s => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.ip})
          </option>
        ))}
      </select>
    </div>
  );
}
