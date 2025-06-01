import * as fs from "fs";
import * as crypto from "crypto";
import axios from "axios";
import type { WithDrawFundsParams } from "./types";

/**
 * Função para assinar um payload com uma chave privada
 *
 * @param payload - O objeto de payload do tipo {@link WithDrawFundsParams} a ser assinado.
 * @param privateKeyPath - O caminho do sistema de arquivos para o arquivo da chave privada (geralmente em formato PEM).
 * @returns Uma string contendo a assinatura digital do payload, codificada em base64.
 * @throws Lança um {@link Error} se ocorrer um problema ao ler o arquivo da chave privada ou se houver qualquer outro erro durante o processo de assinatura.
 * @see {@link https://dom-pagamentos.readme.io/reference/autentica%C3%A7%C3%A3o-com-assinatura-rsa | DOM Pagamentos API - Autenticação com assinatura RSA}
 */
export function signPayload(
  payload: WithDrawFundsParams,
  privateKeyPath: string
) {
  try {
    // Carrega a chave privada
    const privateKey = fs.readFileSync(privateKeyPath, "utf8");

    // Assina o payload usando a chave privada e o algoritmo SHA256
    const sign = crypto.createSign("SHA256");
    sign.update(JSON.stringify(payload));
    sign.end();

    // Gera a assinatura e retorna codificada em base64
    const signature = sign.sign(privateKey, "base64");
    return signature;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao assinar o payload: ${error.message}`);
    }

    throw error;
  }
}
