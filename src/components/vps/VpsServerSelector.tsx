"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const handleValueChange = (value: string) => {
    // Redireciona para a mesma página com o novo ID na URL
    router.push(`/manage/vps?id=${value}`);
  };

  return (
    <div className="w-[280px]">
      <Select defaultValue={currentId} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full bg-background border-slate-200 dark:border-slate-800">
          <SelectValue placeholder="Selecione um servidor" />
        </SelectTrigger>
        <SelectContent>
          {servers.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name} ({s.ip})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
