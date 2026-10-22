export interface Templates {
  result: Result;
}

export interface Result {
  data: Data;
}

export interface Data {
  json: JSON[];
}

export interface JSON {
  id: string;
  name: string;
  description: string;
  version: string;
  logo: string;
  links: Links;
  tags: string[];
}

export interface Links {
  github: string;
  website: string;
  docs: string;
}
