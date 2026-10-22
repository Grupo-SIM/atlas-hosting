import type { NextRequest } from "next/server";
import { handlers } from "@/auth";

export const GET = (
  request: NextRequest,
  context: { params: Promise<any> }
) => {
  return handlers.GET(request);
};

export const POST = (
  request: NextRequest,
  context: { params: Promise<any> }
) => {
  return handlers.POST(request);
};
