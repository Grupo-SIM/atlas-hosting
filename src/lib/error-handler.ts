import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

export function errorHandler(error: unknown) {
  console.error(error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}
