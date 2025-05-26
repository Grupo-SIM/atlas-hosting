import { signIn } from "@/auth";
import { Button } from "../ui/button";
import { FaGithub } from "react-icons/fa6";
import { signInWithGithub } from "@/app/actions";

export default function GithubAuthButton() {
  return (
    <form action={signInWithGithub} className="w-full h-full">
      <Button
        variant="outline"
        type="submit"
        className="flex items-center justify-center gap-2 w-full h-full"
      >
        <FaGithub className="h-4 w-4" />
        GitHub
      </Button>
    </form>
  );
}
