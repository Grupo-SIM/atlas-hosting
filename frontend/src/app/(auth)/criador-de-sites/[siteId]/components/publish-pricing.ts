export function atlasHostingPrice({
  atlasVmMonthlyBrl,
  complimentaryAtlasHosting,
  hostingPaid,
  target,
}: {
  atlasVmMonthlyBrl: number | null;
  complimentaryAtlasHosting: boolean;
  hostingPaid: boolean;
  target: "atlas_vm" | "user_vps";
}): number | null {
  if (target !== "atlas_vm" || hostingPaid || complimentaryAtlasHosting) {
    return null;
  }
  return atlasVmMonthlyBrl;
}
