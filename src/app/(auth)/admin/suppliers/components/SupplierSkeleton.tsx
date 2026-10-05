import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SupplierSkeleton({ title, inventory = false }: { title: string; inventory?: boolean }) {
  return <Card aria-busy="true"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-4"><span className="sr-only">Consultando fornecedor...</span>{Array.from({ length: inventory ? 4 : 3 }, (_, index) => <div className="space-y-2" key={index}><Skeleton className="h-4 w-48" /><Skeleton className={inventory ? "h-16 w-full" : "h-8 w-32"} /></div>)}</CardContent></Card>;
}
