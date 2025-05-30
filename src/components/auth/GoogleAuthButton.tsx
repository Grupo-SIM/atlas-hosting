import { signInWithGoogle } from "@/app/actions";
import { FaGoogle } from "react-icons/fa6";
import { Button } from "../ui/button";

export default function GoogleAuthButton() {
  return (
    <form action={signInWithGoogle} className="w-full h-full">
      <Button
        variant="outline"
        type="submit"
        className="flex items-center justify-center gap-2 w-full h-full"
      >
        <FaGoogle className="h-4 w-4" />
        Google
      </Button>
    </form>
  );
}
