import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FaMoneyBillTransfer,
} from "react-icons/fa6";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 dark:bg-green-900 rounded-full p-3 w-fit">
            <FaMoneyBillTransfer className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-2xl font-semibold">
            Pagamento Enviado!
          </CardTitle>
          <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
            Seu pagamento foi enviado e está sendo processado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Você receberá uma notificação assim que o pagamento for confirmado.
            Isso pode levar alguns instantes.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild={true}>
            <Link href="/">Voltar para a Página Inicial</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
