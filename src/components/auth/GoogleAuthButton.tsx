import { FaGoogle } from "react-icons/fa6";
import { signInWithGoogle } from "@/app/actions";
import { Button } from "../ui/button";

export default function GoogleAuthButton() {
  return (
    <form action={signInWithGoogle} className="h-full w-full">
      <Button
        className="flex h-full w-full items-center justify-center gap-2"
        type="submit"
        variant="outline"
      >
        <FaGoogle className="h-4 w-4" />
        Google
      </Button>
    </form>
  );
}
