import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import nameSilo from "@/lib/server/apis/namesilo";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const nameSiloId = await nameSilo.createContact({
    fn: "Lucas",
    ln: "Garrafielo",
    ad: "Av Cabo Branco",
    st: "PB",
    zp: "58045010",
    ct: "BR",
    em: "lucasgarrafielo@gmail.com",
    ph: "5583991999999",
    cy: "João Pessoa"
  });

  const user = await db.update(userTable).set({
    namesiloId: nameSiloId,
  }).where(eq(userTable.id, "549a6727-fe07-4824-8cdd-4fe5dca68f57")).returning({
    id: userTable.id,
    namesiloId: userTable.namesiloId,
    name: userTable.name,
  }).execute();

  return Response.json({
    user: user[0],
    namesiloId: nameSiloId,
    message: "Contact created successfully",
  });
}