import { FaGithub } from "react-icons/fa6";
import { Button } from "../ui/button";

export default function GithubAuthButton({ action }: { action: () => void }) {
  return (
    <form action={action} className="h-full w-full">
      <Button
        className="flex h-full w-full items-center justify-center gap-2"
        type="submit"
        variant="outline"
      >
        <FaGithub className="h-4 w-4" />
        GitHub
      </Button>
    </form>
  );
}
