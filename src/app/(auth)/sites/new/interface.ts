export type TemplateApiResponse = [
  { result: { data: { json: TemplateData[] } } },
  { result: { data: { json: string[] } } },
];

export interface TemplateData {
  id: string;
  name: string;
  description: string;
  version: string;
  logo: string;
  links: {
    github: string;
    website: string;
    docs: string;
  };
  tags: string[];
}
