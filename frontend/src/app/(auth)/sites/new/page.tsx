import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import BentoGridComponent from "./components/BentoGrid";
import type { TemplateApiResponse } from "./interface";

export default async function NewSitePage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  if (!user.organization.dokployId) {
    redirect("/organization");
  }

  const templatesResponse = await fetch(
    "https://deploys.atlashosting.com.br/api/trpc/compose.templates,compose.getTags?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22baseUrl%22%3Anull%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22baseUrl%22%3A%5B%22undefined%22%5D%7D%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22baseUrl%22%3Anull%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22baseUrl%22%3A%5B%22undefined%22%5D%7D%7D%7D%7D",
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.DOKPLOY_API_KEY!,
      },
      method: "GET",
    }
  );

  const templates = (await templatesResponse.json()) as TemplateApiResponse;
  const templateData = templates[0].result.data.json;
  const tagsData = templates[1].result.data.json;

  return (
    <div className="container mx-auto py-8">
      <BentoGridComponent
        tags={tagsData}
        templates={templateData}
        user={user}
      />
    </div>
  );
}
