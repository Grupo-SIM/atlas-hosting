import ConfigureWindowsVps from "@/app/vps-windows/configure/[id]/page";

export const dynamic = "force-dynamic";

export default function Page() {
  return <ConfigureWindowsVps embedded />;
}
