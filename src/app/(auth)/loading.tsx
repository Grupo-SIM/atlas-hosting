import { CgSpinner } from "react-icons/cg";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <CgSpinner className="animate-spin h-10 w-10 text-foreground" />
    </div>
  );
}
