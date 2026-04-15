import { handlers } from "@/auth"
import type { NextRequest } from "next/server"

export const GET = (request: NextRequest, context: { params: Promise<any> }) => {
  return handlers.GET(request)
}

export const POST = (request: NextRequest, context: { params: Promise<any> }) => {
  return handlers.POST(request)
}
