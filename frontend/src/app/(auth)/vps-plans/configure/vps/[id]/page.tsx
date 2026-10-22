import VpsConfigurePage from "@/app/vps/configure/[id]/page";

export const dynamic = "force-dynamic";

export default function Page() {
  return <VpsConfigurePage embedded />;
}
