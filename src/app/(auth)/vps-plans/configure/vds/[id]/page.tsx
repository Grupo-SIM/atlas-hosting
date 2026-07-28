import VdsConfigurePage from "@/app/vds/configure/[id]/page";

export const dynamic = "force-dynamic";

export default function Page() {
  return <VdsConfigurePage embedded />;
}
