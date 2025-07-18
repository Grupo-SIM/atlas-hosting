import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TemplateApiResponse } from "./new/interface";
import BentoGridComponent from "./new/components/BentoGrid";

export default async function SitesPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const response = await fetch(
    "https://deploys.atlashosting.com.br/api/trpc/compose.templates,compose.getTags?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22baseUrl%22%3Anull%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22baseUrl%22%3A%5B%22undefined%22%5D%7D%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22baseUrl%22%3Anull%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22baseUrl%22%3A%5B%22undefined%22%5D%7D%7D%7D%7D",
    {
      method: "GET",
      headers: {
        "x-api-key": process.env.DOKPLOY_API_KEY!,
      },
    },
  );

  const templates: TemplateApiResponse = await response.json();
  const templateData = templates[0].result.data.json;
  const tagsData = templates[1].result.data.json;

  return (
    <div className="space-y-6 p-6 pb-16">
      <BentoGridComponent
        templates={templateData}
        tags={tagsData}
        user={user}
      />
    </div>
  );
}
