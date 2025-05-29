import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toBrl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function isValidCPF(cpf = "") {
  let sum = 0,
    remainder;

  cpf = `${cpf}`.replace(/^\D+/gim, "");

  if (cpf.length != 11 || new Set(cpf).size === 1) return false;

  for (let i = 1; i <= 9; i++)
    sum = sum + Number.parseInt(cpf.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if (remainder == 10 || remainder == 11) remainder = 0;
  if (remainder != Number.parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum = sum + Number.parseInt(cpf.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if (remainder == 10 || remainder == 11) remainder = 0;
  if (remainder != Number.parseInt(cpf.substring(10, 11))) return false;

  return true;
}

export function isValidCNPJ(cnpj = "") {
  cnpj = `${cnpj}`.replace(/^\D+/gim, "");

  if (cnpj.length != 14 || new Set(cnpj).size === 1) return false;

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let soma = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    soma += +numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  if (result !== +digits.charAt(0)) return false;

  size = size + 1;
  numbers = cnpj.substring(0, size);
  soma = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    soma += +numbers.charAt(size - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (result !== +digits.charAt(1)) return false;

  return true;
}

export const intersperse = <T>(arr: T[], separator: (n: number) => T): T[] =>
  arr.reduce<T[]>((acc, currentElement, currentIndex) => {
    const isLast = currentIndex === arr.length - 1;
    return [
      ...acc,
      currentElement,
      ...(isLast ? [] : [separator(currentIndex)]),
    ];
  }, []);

export function generateRandomPassword(length = 16) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
  let password = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}
