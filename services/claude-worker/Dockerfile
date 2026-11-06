# syntax=docker/dockerfile:1
# Claude Code por assinatura do usuário (um CLAUDE_CONFIG_DIR por usuário).
# Contexto de build: a raiz do repositório (como o do frontend).
#
# Versão do CLI fixada de propósito: o worker lê a saída `stream-json` e o texto de
# `claude auth login`, que mudam entre releases. Trocar exige testar login e chat.
FROM node:24-bookworm-slim

ARG CLAUDE_CODE_VERSION=2.1.266
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION} \
    && npm cache clean --force

# Credenciais ficam só neste volume, em pastas 700 (uma por usuário).
ENV CLAUDE_CONFIG_DIR=/state/claude
ENV WORKER_USERS_DIR=/state/claude/users
RUN mkdir -p /state/claude/users \
    && chown -R node:node /state/claude \
    && chmod 700 /state/claude /state/claude/users

WORKDIR /app
COPY services/claude-worker/package.json ./
COPY services/claude-worker/src ./src

# Teto de permissões do `claude -p`: nenhuma ferramenta nativa (Bash, Read, Edit…).
# root:644 para o processo (usuário `node`) não conseguir reescrever e se liberar.
COPY --chown=root:root services/claude-worker/managed-settings.json /etc/claude-code/managed-settings.json
RUN chmod 644 /etc/claude-code/managed-settings.json

USER node
EXPOSE 3000
CMD ["node", "src/index.ts"]
