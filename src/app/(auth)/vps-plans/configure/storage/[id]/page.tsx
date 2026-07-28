import ConfigureStorageVps from "@/app/vps-armazenamento/configure/[id]/page";

export const dynamic = "force-dynamic";

export default function Page() {
  return <ConfigureStorageVps embedded />;
}
