# nextjs

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run 
```

This project was created using `bun init` in bun v1.2.13. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Atlas IA

Configure `N8N_URL` com a URL base do n8n no ambiente do servidor em execução
(exemplo: `https://n8n.example.com`). `NEXT_PUBLIC_N8N_URL` continua aceita como
fallback. Ambos os chats usam `/api/chat`, que encaminha mensagens ao webhook
no servidor; a configuração não precisa estar disponível durante o build Docker.
