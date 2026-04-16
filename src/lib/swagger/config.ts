export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Atlas Hosting API",
    version: "1.0.0",
    description:
      "API RESTful para gerenciamento de hospedagem, WordPress, domínios e serviços relacionados",
    contact: {
      name: "Atlas Hosting",
      email: "support@atlashosting.com.br",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor de desenvolvimento",
    },
    {
      url: "https://atlashosting.com.br",
      description: "Servidor de produção",
    },
  ],
  tags: [
    {
      name: "Autenticação",
      description: "Endpoints para autenticação e gerenciamento de usuários",
    },
    {
      name: "WordPress",
      description: "Endpoints para gerenciamento de instalações WordPress",
    },
    {
      name: "Sites",
      description: "Endpoints para gerenciamento de sites e instâncias",
    },
    {
      name: "DNS",
      description: "Endpoints para verificação e gerenciamento de DNS",
    },
    {
      name: "Downloads",
      description: "Endpoints para download de recursos",
    },
    {
      name: "Admin",
      description: "Endpoints administrativos",
    },
    {
      name: "Instalação",
      description: "Endpoints para instalação de WordPress",
    },
    {
      name: "Usuário",
      description: "Endpoints para gerenciamento de usuários",
    },
    {
      name: "OAuth",
      description: "Endpoints para autenticação OAuth (GitHub, Google)",
    },
    {
      name: "Webhooks",
      description: "Endpoints para recebimento de webhooks externos",
    },
    {
      name: "Sites",
      description: "Endpoints para gerenciamento de sites e edição",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT obtido através do endpoint de autenticação",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "session_token",
        description: "Token de sessão armazenado em cookie",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Mensagem de erro",
          },
        },
        required: ["error"],
      },
      Success: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            description: "Indica se a operação foi bem-sucedida",
          },
          result: {
            type: "object",
            description: "Resultado da operação",
          },
        },
        required: ["success"],
      },
      WordPressCoreAction: {
        type: "object",
        properties: {
          instanceId: {
            type: "number",
            description: "ID da instância WordPress",
          },
          action: {
            type: "string",
            enum: [
              "check-core-updates",
              "update-core",
              "get-version",
              "maintenance-mode-on",
              "maintenance-mode-off",
            ],
            description: "Ação a ser executada",
          },
        },
        required: ["instanceId", "action"],
      },
      WordPressPluginAction: {
        type: "object",
        properties: {
          instanceId: {
            type: "number",
            description: "ID da instância WordPress",
          },
          action: {
            type: "string",
            enum: [
              "install-plugin",
              "list-plugins",
              "activate-plugin",
              "deactivate-plugin",
              "update-plugin",
            ],
            description: "Ação a ser executada",
          },
          pluginData: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "ID do plugin (para instalação)",
              },
              name: {
                type: "string",
                description: "Nome do plugin (para outras ações)",
              },
            },
          },
        },
        required: ["instanceId", "action"],
      },
      WordPressThemeAction: {
        type: "object",
        properties: {
          instanceId: {
            type: "number",
            description: "ID da instância WordPress",
          },
          action: {
            type: "string",
            enum: ["activate", "update", "delete", "install"],
            description: "Ação a ser executada",
          },
          themeName: {
            type: "string",
            description: "Nome do tema (para activate, update, delete)",
          },
          themeSlug: {
            type: "string",
            description: "Slug do tema (para install)",
          },
        },
        required: ["instanceId", "action"],
      },
    },
  },
  paths: {
    "/api/wordpress/core": {
      post: {
        tags: ["WordPress"],
        summary: "Gerenciar WordPress Core",
        description:
          "Executa ações relacionadas ao core do WordPress (verificar atualizações, atualizar, obter versão, modo de manutenção)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WordPressCoreAction",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Operação bem-sucedida",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          400: {
            description: "Requisição inválida",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/wordpress/plugins": {
      post: {
        tags: ["WordPress"],
        summary: "Gerenciar Plugins WordPress",
        description:
          "Instala, lista, ativa, desativa ou atualiza plugins do WordPress",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WordPressPluginAction",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Operação bem-sucedida",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          400: {
            description: "Requisição inválida",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/wordpress/themes": {
      post: {
        tags: ["WordPress"],
        summary: "Gerenciar Temas WordPress",
        description: "Ativa, atualiza, deleta ou instala temas do WordPress",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WordPressThemeAction",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Operação bem-sucedida",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
          },
          400: {
            description: "Requisição inválida",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/sites/{instanceId}": {
      delete: {
        tags: ["Sites"],
        summary: "Deletar Instância WordPress",
        description:
          "Remove uma ou múltiplas instâncias WordPress. Pode receber um ID único ou múltiplos IDs separados por vírgula.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "instanceId",
            in: "path",
            required: true,
            description:
              "ID da instância ou múltiplos IDs separados por vírgula (ex: 1,2,3)",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          204: {
            description: "Instância(s) deletada(s) com sucesso",
          },
          400: {
            description: "ID de instância inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/check-dns": {
      get: {
        tags: ["DNS"],
        summary: "Verificar DNS",
        description:
          "Verifica as configurações DNS de um ou múltiplos domínios. Retorna Server-Sent Events (SSE) para atualizações em tempo real.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "domains",
            in: "query",
            required: true,
            description:
              "Domínios a serem verificados, separados por vírgula (ex: example.com,www.example.com)",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Stream de eventos SSE com atualizações DNS",
            content: {
              "text/event-stream": {
                schema: {
                  type: "string",
                  description:
                    "Server-Sent Events stream com atualizações de status DNS",
                },
              },
            },
          },
          400: {
            description: "Parâmetros inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/domains/sync": {
      post: {
        tags: ["DNS"],
        summary: "Sincronizar domínios Namecheap",
        description:
          "Sincroniza os domínios da conta master da Namecheap com o banco de dados da organização vinculada ao e-mail fornecido.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "E-mail do usuário dono da organização",
                  },
                },
                required: ["email"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Sincronização concluída",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    details: { type: "string" },
                    syncedDomains: {
                      type: "array",
                      items: { type: "string" },
                    },
                    count: { type: "number" },
                  },
                },
              },
            },
          },
          400: { description: "Requisição inválida (falta e-mail)" },
          404: { description: "Usuário ou organização não encontrados" },
          500: { description: "Erro interno no servidor" },
        },
      },
    },
    "/api/auth": {
      get: {
        tags: ["Autenticação"],
        summary: "Obter informações de autenticação",
        description: "Retorna informações sobre a sessão atual",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Informações de autenticação",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Autenticação"],
        summary: "Autenticar usuário",
        description: "Realiza login do usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                  },
                  password: {
                    type: "string",
                    format: "password",
                  },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Autenticação bem-sucedida",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    user: {
                      type: "object",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Credenciais inválidas",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Autenticação"],
        summary: "Fazer logout do usuário",
        description:
          "Encerra a sessão do usuário atual. Remove os cookies de autenticação, invalida a sessão no banco de dados (NextAuth e sessões customizadas) e limpa todos os tokens de autenticação.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Logout realizado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                      example: "success",
                    },
                    message: {
                      type: "string",
                      example: "Logout realizado com sucesso",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Usuário não autenticado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                      example: "error",
                    },
                    message: {
                      type: "string",
                      example: "Usuário não autenticado",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                      example: "error",
                    },
                    message: {
                      type: "string",
                      example: "Erro ao fazer logout. Tente novamente.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/signup": {
      post: {
        tags: ["Autenticação"],
        summary: "Criar nova conta",
        description:
          "Cria uma nova conta de usuário. O usuário receberá um email de verificação após o cadastro.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email do usuário",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    maxLength: 100,
                    description: "Senha do usuário (mínimo 8 caracteres)",
                  },
                  fullName: {
                    type: "string",
                    description: "Nome completo do usuário (deve conter pelo menos 2 palavras)",
                  },
                  organizationName: {
                    type: "string",
                    description: "Nome da organização",
                  },
                  referrerId: {
                    type: "string",
                    description: "ID do usuário afiliado (opcional)",
                  },
                },
                required: ["email", "password", "fullName", "organizationName"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Conta criada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["success"],
                    },
                    message: {
                      type: "string",
                      example: "Conta criada com sucesso! Verifique seu email para ativar a conta.",
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                        },
                        name: {
                          type: "string",
                        },
                        email: {
                          type: "string",
                          format: "email",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Dados inválidos ou email já em uso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["error"],
                    },
                    message: {
                      type: "string",
                    },
                    errors: {
                      type: "array",
                      items: {
                        type: "object",
                      },
                      description: "Detalhes dos erros de validação (apenas para erros Zod)",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Autenticação"],
        summary: "Redefinir senha",
        description: "Redefine a senha do usuário usando um token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: {
                    type: "string",
                    description: "Token de redefinição de senha",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    description: "Nova senha",
                  },
                },
                required: ["token", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Senha redefinida com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Token inválido ou expirado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/downloads/{plugin}": {
      get: {
        tags: ["Downloads"],
        summary: "Download de Plugin",
        description: "Faz download de um plugin WordPress",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "plugin",
            in: "path",
            required: true,
            description: "Nome do plugin (ex: atlashosting-migrator.zip)",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Download iniciado",
            content: {
              "application/zip": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          404: {
            description: "Plugin não encontrado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/request-password-reset": {
      post: {
        tags: ["Autenticação"],
        summary: "Solicitar reset de senha",
        description:
          "Solicita um email com token para redefinição de senha",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email do usuário",
                  },
                },
                required: ["email"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email de reset enviado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Email inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/verify-email": {
      post: {
        tags: ["Autenticação"],
        summary: "Verificar email",
        description: "Verifica o email do usuário usando um token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: {
                    type: "string",
                    description: "Token de verificação de email",
                  },
                },
                required: ["token"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email verificado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Token inválido ou expirado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/resend-verification": {
      post: {
        tags: ["Autenticação"],
        summary: "Reenviar email de verificação",
        description: "Reenvia o email de verificação para o usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email do usuário",
                  },
                },
                required: ["email"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email de verificação reenviado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Email inválido ou já verificado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/request-change-email": {
      post: {
        tags: ["Autenticação"],
        summary: "Solicitar mudança de email",
        description:
          "Solicita mudança de email. Requer senha atual para confirmação",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  newEmail: {
                    type: "string",
                    format: "email",
                    description: "Novo endereço de email",
                  },
                  currentPassword: {
                    type: "string",
                    format: "password",
                    description: "Senha atual do usuário",
                  },
                },
                required: ["newEmail", "currentPassword"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email de verificação enviado para o novo endereço",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                    },
                    newEmail: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Senha incorreta ou email já em uso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/verify-change-email": {
      get: {
        tags: ["Autenticação"],
        summary: "Verificar token de mudança de email (GET)",
        description:
          "Valida um token de mudança de email via query parameters",
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            description: "Token de verificação",
            schema: {
              type: "string",
            },
          },
          {
            name: "email",
            in: "query",
            required: true,
            description: "Novo email a ser verificado",
            schema: {
              type: "string",
              format: "email",
            },
          },
        ],
        responses: {
          200: {
            description: "Token válido",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: {
                      type: "boolean",
                    },
                    email: {
                      type: "string",
                    },
                    userId: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Token inválido ou expirado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Autenticação"],
        summary: "Verificar e confirmar mudança de email",
        description: "Verifica o token e confirma a mudança de email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: {
                    type: "string",
                    description: "Token de verificação",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "Novo email",
                  },
                },
                required: ["token", "email"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email alterado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                    },
                    newEmail: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Token inválido ou expirado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/callback/github": {
      get: {
        tags: ["OAuth"],
        summary: "Callback OAuth GitHub (GET)",
        description: "Callback para autenticação OAuth do GitHub",
        responses: {
          302: {
            description: "Redirecionamento após autenticação",
          },
        },
      },
      post: {
        tags: ["OAuth"],
        summary: "Callback OAuth GitHub (POST)",
        description: "Callback para autenticação OAuth do GitHub",
        responses: {
          302: {
            description: "Redirecionamento após autenticação",
          },
        },
      },
    },
    "/api/auth/callback/google": {
      get: {
        tags: ["OAuth"],
        summary: "Callback OAuth Google (GET)",
        description: "Callback para autenticação OAuth do Google",
        responses: {
          302: {
            description: "Redirecionamento após autenticação",
          },
        },
      },
      post: {
        tags: ["OAuth"],
        summary: "Callback OAuth Google (POST)",
        description: "Callback para autenticação OAuth do Google",
        responses: {
          302: {
            description: "Redirecionamento após autenticação",
          },
        },
      },
    },
    "/api/auth/signin/github": {
      get: {
        tags: ["OAuth"],
        summary: "Login com GitHub (GET)",
        description: "Inicia o fluxo de autenticação com GitHub",
        responses: {
          302: {
            description: "Redirecionamento para GitHub OAuth",
          },
        },
      },
      post: {
        tags: ["OAuth"],
        summary: "Login com GitHub (POST)",
        description: "Inicia o fluxo de autenticação com GitHub",
        responses: {
          302: {
            description: "Redirecionamento para GitHub OAuth",
          },
        },
      },
    },
    "/api/auth/github/token": {
      get: {
        tags: ["OAuth"],
        summary: "Obter token do GitHub",
        description:
          "Obtém o token de acesso do GitHub após autenticação OAuth",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            description: "Código de autorização do GitHub",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          302: {
            description: "Redirecionamento após obter token",
          },
          400: {
            description: "Código de autorização inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/wordpress/transfer": {
      post: {
        tags: ["WordPress"],
        summary: "Transferir instalação WordPress",
        description:
          "Transfere uma instalação WordPress existente para o Atlas Hosting",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "Arquivo ZIP do WordPress exportado",
                  },
                  domain: {
                    type: "string",
                    description: "Domínio de destino",
                  },
                  userEmail: {
                    type: "string",
                    format: "email",
                    description: "Email do administrador",
                  },
                },
                required: ["file", "domain"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Transferência iniciada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Arquivo ou domínio inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/wp-install-w": {
      get: {
        tags: ["Instalação"],
        summary: "Instalar WordPress",
        description:
          "Instala uma nova instalação WordPress. Retorna Server-Sent Events (SSE) para progresso em tempo real",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "domain",
            in: "query",
            required: true,
            description: "Domínio onde instalar o WordPress",
            schema: {
              type: "string",
            },
          },
          {
            name: "admin_username",
            in: "query",
            required: true,
            description: "Nome de usuário do administrador",
            schema: {
              type: "string",
            },
          },
          {
            name: "admin_password",
            in: "query",
            required: true,
            description: "Senha do administrador",
            schema: {
              type: "string",
              format: "password",
            },
          },
          {
            name: "site_name",
            in: "query",
            required: false,
            description: "Nome do site",
            schema: {
              type: "string",
            },
          },
          {
            name: "admin_email",
            in: "query",
            required: false,
            description: "Email do administrador",
            schema: {
              type: "string",
              format: "email",
            },
          },
          {
            name: "plugins",
            in: "query",
            required: false,
            description: "Plugins a serem instalados (separados por vírgula)",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Stream de eventos SSE com progresso da instalação",
            content: {
              "text/event-stream": {
                schema: {
                  type: "string",
                  description:
                    "Server-Sent Events stream com progresso da instalação",
                },
              },
            },
          },
          400: {
            description: "Parâmetros inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/newuser": {
      get: {
        tags: ["Usuário"],
        summary: "Criar organização para novo usuário",
        description:
          "Cria uma organização e carteira para um novo usuário que ainda não possui organização",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          302: {
            description: "Redirecionamento para página inicial após criar organização",
          },
          200: {
            description: "Organização criada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/cleanup-tokens": {
      post: {
        tags: ["Admin"],
        summary: "Limpar tokens expirados",
        description:
          "Remove tokens expirados do banco de dados. Deve ser executado periodicamente (ex: via cron job)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Tokens limpos com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/webhook/dom": {
      post: {
        tags: ["Webhooks"],
        summary: "Webhook de pagamento e domínios",
        description:
          "Recebe webhooks do sistema de pagamento para processar eventos relacionados a assinaturas, faturas e registro de domínios",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  event: {
                    type: "string",
                    enum: [
                      "SIGNATURE-CREATED",
                      "SIGNATURE-CANCELLED",
                      "SIGNATURE-INVOICE-CREATED",
                      "SIGNATURE-INVOICE-PAID",
                      "CHARGE-APPROVED",
                    ],
                    description: "Tipo de evento do webhook",
                  },
                  data: {
                    type: "object",
                    properties: {
                      external_reference: {
                        type: "string",
                        description: "ID da referência externa (invoice ID, etc)",
                      },
                      metadata: {
                        type: "object",
                        properties: {
                          years: {
                            type: "string",
                            description: "Anos de registro do domínio",
                          },
                          whoisguard: {
                            type: "string",
                            description: "Se o WhoisGuard está ativado",
                          },
                        },
                      },
                    },
                    required: ["external_reference"],
                  },
                },
                required: ["event", "data"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Webhook processado com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                    actionTaken: {
                      type: "string",
                      description: "Descrição da ação tomada",
                    },
                    webhookType: {
                      type: "string",
                      description: "Tipo de evento processado",
                    },
                    details: {
                      type: "object",
                      description: "Detalhes do processamento",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Payload inválido ou erro no processamento",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    message: {
                      type: "string",
                    },
                    error: {
                      type: "object",
                      properties: {
                        message: {
                          type: "string",
                        },
                        stack: {
                          type: "string",
                        },
                      },
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Erro interno do servidor",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/sites/edit": {
      get: {
        tags: ["Sites"],
        summary: "Editar site WordPress",
        description:
          "Obtém token JWT e redireciona para a página de edição do Elementor no WordPress",
        parameters: [
          {
            name: "site",
            in: "query",
            required: true,
            description: "URL do site WordPress",
            schema: {
              type: "string",
              format: "uri",
            },
          },
        ],
        responses: {
          302: {
            description: "Redirecionamento para página de edição do Elementor",
          },
          400: {
            description: "Parâmetro site não fornecido ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          500: {
            description: "Erro ao obter token JWT",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
  },
};

