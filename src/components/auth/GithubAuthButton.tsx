import { Button } from "../ui/button";
import { FaGithub } from "react-icons/fa6";

export default function GithubAuthButton({ action }: { action: () => void }) {
  return (
    <form action={action} className="w-full h-full">
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
