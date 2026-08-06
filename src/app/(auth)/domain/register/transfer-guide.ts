export const transferGuide = {
  notice:
    "A Atlas não altera registros DNS, hospedagem, e-mail ou nameservers durante a verificação.",
  steps: [
    "Adicione seu domínio existente acima",
    "Crie o registro TXT exibido pela Atlas no DNS atual",
    "Aguarde a propagação DNS, que pode levar alguns minutos",
    'Clique em "Verificar" para confirmar a propriedade e ativar o domínio',
  ],
  warnings: [
    "Não altere registros A, MX ou nameservers para verificar o domínio.",
    "O site e o e-mail continuam no provedor atual até uma migração separada.",
  ],
} as const;
