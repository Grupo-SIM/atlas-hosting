export const swaggerConfig = {
  components: {
    schemas: {
      Error: {
        properties: {
          error: {
            description: "Mensagem de erro",
            type: "string",
          },
        },
        required: ["error"],
        type: "object",
      },
      Success: {
        properties: {
          result: {
            description: "Resultado da operação",
            type: "object",
          },
          success: {
            description: "Indica se a operação foi bem-sucedida",
            type: "boolean",
          },
        },
        required: ["success"],
        type: "object",
      },
      WordPressCoreAction: {
        properties: {
          action: {
            description: "Ação a ser executada",
            enum: [
              "check-core-updates",
              "update-core",
              "get-version",
              "maintenance-mode-on",
              "maintenance-mode-off",
            ],
            type: "string",
          },
          instanceId: {
            description: "ID da instância WordPress",
            type: "number",
          },
        },
        required: ["instanceId", "action"],
        type: "object",
      },
      WordPressPluginAction: {
        properties: {
          action: {
            description: "Ação a ser executada",
            enum: [
              "install-plugin",
              "list-plugins",
              "activate-plugin",
              "deactivate-plugin",
              "update-plugin",
            ],
            type: "string",
          },
          instanceId: {
            description: "ID da instância WordPress",
            type: "number",
          },
          pluginData: {
            properties: {
              id: {
                description: "ID do plugin (para instalação)",
                type: "string",
              },
              name: {
                description: "Nome do plugin (para outras ações)",
                type: "string",
              },
            },
            type: "object",
          },
        },
        required: ["instanceId", "action"],
        type: "object",
      },
      WordPressThemeAction: {
        properties: {
          action: {
            description: "Ação a ser executada",
            enum: ["activate", "update", "delete", "install"],
            type: "string",
          },
          instanceId: {
            description: "ID da instância WordPress",
            type: "number",
          },
          themeName: {
            description: "Nome do tema (para activate, update, delete)",
            type: "string",
          },
          themeSlug: {
            description: "Slug do tema (para install)",
            type: "string",
          },
        },
        required: ["instanceId", "action"],
        type: "object",
      },
    },
    securitySchemes: {
      bearerAuth: {
        bearerFormat: "JWT",
        description: "Token JWT obtido através do endpoint de autenticação",
        scheme: "bearer",
        type: "http",
      },
      cookieAuth: {
        description: "Token de sessão armazenado em cookie",
        in: "cookie",
        name: "session_token",
        type: "apiKey",
      },
    },
  },
  info: {
    contact: {
      email: "support@atlashosting.com.br",
      name: "Atlas Hosting",
    },
    description:
      "API RESTful para gerenciamento de hospedagem, WordPress, domínios e serviços relacionados",
    title: "Atlas Hosting API",
    version: "1.0.0",
  },
  openapi: "3.0.0",
  paths: {
    "/api/admin/cleanup-tokens": {
      post: {
        description:
          "Remove tokens expirados do banco de dados. Deve ser executado periodicamente (ex: via cron job)",
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                    success: {
                      type: "boolean",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Tokens limpos com sucesso",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Limpar tokens expirados",
        tags: ["Admin"],
      },
    },
    "/api/admin/promote": {
      post: {
        description:
          "Promove um usuário ao cargo de Administrador pelo e-mail. Requer ser Admin ou usar o Secret Key.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  email: {
                    description: "E-mail do usuário a ser promovido",
                    type: "string",
                  },
                },
                required: ["email"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: { description: "Usuário promovido com sucesso" },
          403: { description: "Não autorizado" },
          404: { description: "Usuário não encontrado" },
        },
        summary: "Promover usuário para Admin",
        tags: ["Admin"],
      },
    },
    "/api/auth": {
      get: {
        description: "Retorna informações sobre a sessão atual",
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    user: {
                      type: "object",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Informações de autenticação",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Obter informações de autenticação",
        tags: ["Autenticação"],
      },
      post: {
        description: "Realiza login do usuário",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  email: {
                    format: "email",
                    type: "string",
                  },
                  password: {
                    format: "password",
                    type: "string",
                  },
                },
                required: ["email", "password"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    success: {
                      type: "boolean",
                    },
                    user: {
                      type: "object",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Autenticação bem-sucedida",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Credenciais inválidas",
          },
        },
        summary: "Autenticar usuário",
        tags: ["Autenticação"],
      },
    },
    "/api/auth/callback/github": {
      get: {
        description: "Callback para autenticação OAuth do GitHub",
        responses: {
          302: {
            description: "Redirecionamento após autenticação",
          },
        },
        summary: "Callback OAuth GitHub (GET)",
        tags: ["OAuth"],
      },
      post: {
        description: "Callback para autenticação OAuth do GitHub",
        responses: {
          302: {
            description: "Redirecionamento após autenticação",
          },
        },
        summary: "Callback OAuth GitHub (POST)",
        tags: ["OAuth"],
      },
    },
    "/api/auth/callback/google": {
      get: {
        description: "Callback para autenticação OAuth do Google",
        responses: {
          302: {
            description: "Redirecionamento após autenticação",
          },
        },
        summary: "Callback OAuth Google (GET)",
        tags: ["OAuth"],
      },
      post: {
        description: "Callback para autenticação OAuth do Google",
        responses: {
          302: {
            description: "Redirecionamento após autenticação",
          },
        },
        summary: "Callback OAuth Google (POST)",
        tags: ["OAuth"],
      },
    },
    "/api/auth/github/token": {
      get: {
        description:
          "Obtém o token de acesso do GitHub após autenticação OAuth",
        parameters: [
          {
            description: "Código de autorização do GitHub",
            in: "query",
            name: "code",
            required: true,
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
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Código de autorização inválido",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Obter token do GitHub",
        tags: ["OAuth"],
      },
    },
    "/api/auth/logout": {
      post: {
        description:
          "Encerra a sessão do usuário atual. Remove os cookies de autenticação, invalida a sessão no banco de dados (NextAuth e sessões customizadas) e limpa todos os tokens de autenticação.",
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      example: "Logout realizado com sucesso",
                      type: "string",
                    },
                    status: {
                      enum: ["success"],
                      example: "success",
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Logout realizado com sucesso",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      example: "Usuário não autenticado",
                      type: "string",
                    },
                    status: {
                      enum: ["error"],
                      example: "error",
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Usuário não autenticado",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      example: "Erro ao fazer logout. Tente novamente.",
                      type: "string",
                    },
                    status: {
                      enum: ["error"],
                      example: "error",
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Fazer logout do usuário",
        tags: ["Autenticação"],
      },
    },
    "/api/auth/request-change-email": {
      post: {
        description:
          "Solicita mudança de email. Requer senha atual para confirmação",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  currentPassword: {
                    description: "Senha atual do usuário",
                    format: "password",
                    type: "string",
                  },
                  newEmail: {
                    description: "Novo endereço de email",
                    format: "email",
                    type: "string",
                  },
                },
                required: ["newEmail", "currentPassword"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                    newEmail: {
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Email de verificação enviado para o novo endereço",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Senha incorreta ou email já em uso",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Solicitar mudança de email",
        tags: ["Autenticação"],
      },
    },
    "/api/auth/request-password-reset": {
      post: {
        description: "Solicita um email com token para redefinição de senha",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  email: {
                    description: "Email do usuário",
                    format: "email",
                    type: "string",
                  },
                },
                required: ["email"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Email de reset enviado com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Email inválido",
          },
        },
        summary: "Solicitar reset de senha",
        tags: ["Autenticação"],
      },
    },
    "/api/auth/resend-verification": {
      post: {
        description: "Reenvia o email de verificação para o usuário",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  email: {
                    description: "Email do usuário",
                    format: "email",
                    type: "string",
                  },
                },
                required: ["email"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Email de verificação reenviado",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Email inválido ou já verificado",
          },
        },
        summary: "Reenviar email de verificação",
        tags: ["Autenticação"],
      },
    },
    "/api/auth/reset-password": {
      post: {
        description: "Redefine a senha do usuário usando um token",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  password: {
                    description: "Nova senha",
                    format: "password",
                    type: "string",
                  },
                  token: {
                    description: "Token de redefinição de senha",
                    type: "string",
                  },
                },
                required: ["token", "password"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                    success: {
                      type: "boolean",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Senha redefinida com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Token inválido ou expirado",
          },
        },
        summary: "Redefinir senha",
        tags: ["Autenticação"],
      },
    },
    "/api/auth/signin/github": {
      get: {
        description: "Inicia o fluxo de autenticação com GitHub",
        responses: {
          302: {
            description: "Redirecionamento para GitHub OAuth",
          },
        },
        summary: "Login com GitHub (GET)",
        tags: ["OAuth"],
      },
      post: {
        description: "Inicia o fluxo de autenticação com GitHub",
        responses: {
          302: {
            description: "Redirecionamento para GitHub OAuth",
          },
        },
        summary: "Login com GitHub (POST)",
        tags: ["OAuth"],
      },
    },
    "/api/auth/signup": {
      post: {
        description:
          "Cria uma nova conta de usuário. O usuário receberá um email de verificação após o cadastro.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  email: {
                    description: "Email do usuário",
                    format: "email",
                    type: "string",
                  },
                  fullName: {
                    description:
                      "Nome completo do usuário (deve conter pelo menos 2 palavras)",
                    type: "string",
                  },
                  organizationName: {
                    description: "Nome da organização",
                    type: "string",
                  },
                  password: {
                    description: "Senha do usuário (mínimo 8 caracteres)",
                    format: "password",
                    maxLength: 100,
                    minLength: 8,
                    type: "string",
                  },
                  referrerId: {
                    description: "ID do usuário afiliado (opcional)",
                    type: "string",
                  },
                },
                required: ["email", "password", "fullName", "organizationName"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          201: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      example:
                        "Conta criada com sucesso! Verifique seu email para ativar a conta.",
                      type: "string",
                    },
                    status: {
                      enum: ["success"],
                      type: "string",
                    },
                    user: {
                      properties: {
                        email: {
                          format: "email",
                          type: "string",
                        },
                        id: {
                          type: "string",
                        },
                        name: {
                          type: "string",
                        },
                      },
                      type: "object",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Conta criada com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    errors: {
                      description:
                        "Detalhes dos erros de validação (apenas para erros Zod)",
                      items: {
                        type: "object",
                      },
                      type: "array",
                    },
                    message: {
                      type: "string",
                    },
                    status: {
                      enum: ["error"],
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Dados inválidos ou email já em uso",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        summary: "Criar nova conta",
        tags: ["Autenticação"],
      },
    },
    "/api/auth/verify-change-email": {
      get: {
        description: "Valida um token de mudança de email via query parameters",
        parameters: [
          {
            description: "Token de verificação",
            in: "query",
            name: "token",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            description: "Novo email a ser verificado",
            in: "query",
            name: "email",
            required: true,
            schema: {
              format: "email",
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    email: {
                      type: "string",
                    },
                    userId: {
                      type: "string",
                    },
                    valid: {
                      type: "boolean",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Token válido",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Token inválido ou expirado",
          },
        },
        summary: "Verificar token de mudança de email (GET)",
        tags: ["Autenticação"],
      },
      post: {
        description: "Verifica o token e confirma a mudança de email",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  email: {
                    description: "Novo email",
                    format: "email",
                    type: "string",
                  },
                  token: {
                    description: "Token de verificação",
                    type: "string",
                  },
                },
                required: ["token", "email"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                    newEmail: {
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Email alterado com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Token inválido ou expirado",
          },
        },
        summary: "Verificar e confirmar mudança de email",
        tags: ["Autenticação"],
      },
    },
    "/api/auth/verify-email": {
      post: {
        description: "Verifica o email do usuário usando um token",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  token: {
                    description: "Token de verificação de email",
                    type: "string",
                  },
                },
                required: ["token"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                    success: {
                      type: "boolean",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Email verificado com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Token inválido ou expirado",
          },
        },
        summary: "Verificar email",
        tags: ["Autenticação"],
      },
    },
    "/api/check-dns": {
      get: {
        description:
          "Verifica as configurações DNS de um ou múltiplos domínios. Retorna Server-Sent Events (SSE) para atualizações em tempo real.",
        parameters: [
          {
            description:
              "Domínios a serem verificados, separados por vírgula (ex: example.com,www.example.com)",
            in: "query",
            name: "domains",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            content: {
              "text/event-stream": {
                schema: {
                  description:
                    "Server-Sent Events stream com atualizações de status DNS",
                  type: "string",
                },
              },
            },
            description: "Stream de eventos SSE com atualizações DNS",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Parâmetros inválidos",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Verificar DNS",
        tags: ["DNS"],
      },
    },
    "/api/domains/sync": {
      post: {
        description:
          "Sincroniza os domínios da conta master da Namecheap com o banco de dados da organização vinculada ao e-mail fornecido.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  email: {
                    description: "E-mail do usuário dono da organização",
                    format: "email",
                    type: "string",
                  },
                },
                required: ["email"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    count: { type: "number" },
                    details: { type: "string" },
                    message: { type: "string" },
                    syncedDomains: {
                      items: { type: "string" },
                      type: "array",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Sincronização concluída",
          },
          400: { description: "Requisição inválida (falta e-mail)" },
          404: { description: "Usuário ou organização não encontrados" },
          500: { description: "Erro interno no servidor" },
        },
        summary: "Sincronizar domínios Namecheap",
        tags: ["DNS"],
      },
    },
    "/api/downloads/{plugin}": {
      get: {
        description: "Faz download de um plugin WordPress",
        parameters: [
          {
            description: "Nome do plugin (ex: atlashosting-migrator.zip)",
            in: "path",
            name: "plugin",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            content: {
              "application/zip": {
                schema: {
                  format: "binary",
                  type: "string",
                },
              },
            },
            description: "Download iniciado",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
          404: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Plugin não encontrado",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Download de Plugin",
        tags: ["Downloads"],
      },
    },
    "/api/newuser": {
      get: {
        description:
          "Cria uma organização e carteira para um novo usuário que ainda não possui organização",
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                    success: {
                      type: "boolean",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Organização criada com sucesso",
          },
          302: {
            description:
              "Redirecionamento para página inicial após criar organização",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Criar organização para novo usuário",
        tags: ["Usuário"],
      },
    },
    "/api/sites/{instanceId}": {
      delete: {
        description:
          "Remove uma ou múltiplas instâncias WordPress. Pode receber um ID único ou múltiplos IDs separados por vírgula.",
        parameters: [
          {
            description:
              "ID da instância ou múltiplos IDs separados por vírgula (ex: 1,2,3)",
            in: "path",
            name: "instanceId",
            required: true,
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
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "ID de instância inválido",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Deletar Instância WordPress",
        tags: ["Sites"],
      },
    },
    "/api/vps/fix-token": {
      post: {
        description:
          "Atualiza o token de autenticação de um servidor VPS no banco de dados. Informe o IP do VPS e o novo token desejado.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  ip: {
                    description: "IP do servidor VPS",
                    example: "192.168.1.100",
                    type: "string",
                  },
                  newToken: {
                    description: "Novo token que o bot Sentinel vai utilizar",
                    example: "atlas_abc123def456...",
                    type: "string",
                  },
                },
                required: ["vpsId", "newToken"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    match: {
                      description: "true se a gravação foi confirmada",
                      type: "boolean",
                    },
                    newToken: {
                      description: "Token novo aplicado",
                      type: "string",
                    },
                    oldToken: {
                      description: "Token anterior",
                      type: "string",
                    },
                    success: { example: true, type: "boolean" },
                    vpsIp: {
                      description: "IP do servidor",
                      type: "string",
                    },
                    vpsName: {
                      description: "Nome do servidor",
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Token atualizado com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
            description: "Campos obrigatórios faltando",
          },
          404: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
            description: "VPS não encontrado",
          },
          500: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
            description: "Erro interno",
          },
        },
        summary: "Atualizar token de um servidor VPS",
        tags: ["VPS"],
      },
    },
    "/api/vps/telemetry": {
      get: {
        description:
          "O bot Sentinel consulta este endpoint periodicamente para verificar se deve enviar dados atualizados (forceRefresh). Autentica via token na query string.",
        parameters: [
          {
            description: "Token de autenticação do servidor VPS",
            in: "query",
            name: "token",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    interval: {
                      description: "Intervalo sugerido entre envios (segundos)",
                      example: 60,
                      type: "number",
                    },
                    refresh: {
                      description:
                        "true se o bot deve enviar dados imediatamente",
                      type: "boolean",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Status de refresh",
          },
          400: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
            description: "Token ausente",
          },
          401: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
            description: "Token inválido",
          },
        },
        summary: "Consultar sinal de refresh",
        tags: ["VPS"],
      },
      post: {
        description:
          "Recebe métricas do bot Sentinel instalado na VPS (CPU, RAM, disco, processos). Autentica via token do servidor.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  cpu_usage: {
                    description: "Uso de CPU em porcentagem",
                    example: 42.5,
                    type: "number",
                  },
                  disk_usage: {
                    description: "Uso de disco em porcentagem",
                    example: 61.0,
                    type: "number",
                  },
                  metadata: {
                    description:
                      "Metadados adicionais (cores, load avg, discos)",
                    type: "object",
                  },
                  process_count: {
                    description: "Número total de PIDs",
                    example: 568,
                    type: "number",
                  },
                  processes: {
                    description: "Lista dos top processos por CPU",
                    items: {
                      properties: {
                        cpu: { type: "number" },
                        mem_abs: { type: "string" },
                        name: { type: "string" },
                        pid: { type: "number" },
                      },
                      type: "object",
                    },
                    type: "array",
                  },
                  ram_usage: {
                    description: "Uso de RAM em porcentagem",
                    example: 31.8,
                    type: "number",
                  },
                  token: {
                    description: "Token de autenticação do servidor VPS",
                    example: "atlas_abc123...",
                    type: "string",
                  },
                  uptime: {
                    description: "Tempo desde o último boot",
                    example: "107d 19h",
                    type: "string",
                  },
                },
                required: ["token"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    success: { example: true, type: "boolean" },
                  },
                  type: "object",
                },
              },
            },
            description: "Métricas recebidas com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
            description: "Token ausente",
          },
          401: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
            description: "Token inválido ou servidor não registrado",
          },
          500: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
            description: "Erro interno",
          },
        },
        summary: "Enviar métricas de telemetria",
        tags: ["VPS"],
      },
    },
    "/api/wordpress/core": {
      post: {
        description:
          "Executa ações relacionadas ao core do WordPress (verificar atualizações, atualizar, obter versão, modo de manutenção)",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WordPressCoreAction",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
            description: "Operação bem-sucedida",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Requisição inválida",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Gerenciar WordPress Core",
        tags: ["WordPress"],
      },
    },
    "/api/wordpress/plugins": {
      post: {
        description:
          "Instala, lista, ativa, desativa ou atualiza plugins do WordPress",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WordPressPluginAction",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
            description: "Operação bem-sucedida",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Requisição inválida",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Gerenciar Plugins WordPress",
        tags: ["WordPress"],
      },
    },
    "/api/wordpress/themes": {
      post: {
        description: "Ativa, atualiza, deleta ou instala temas do WordPress",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/WordPressThemeAction",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Success",
                },
              },
            },
            description: "Operação bem-sucedida",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Requisição inválida",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Gerenciar Temas WordPress",
        tags: ["WordPress"],
      },
    },
    "/api/wordpress/transfer": {
      post: {
        description:
          "Transfere uma instalação WordPress existente para o Atlas Hosting",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                properties: {
                  domain: {
                    description: "Domínio de destino",
                    type: "string",
                  },
                  file: {
                    description: "Arquivo ZIP do WordPress exportado",
                    format: "binary",
                    type: "string",
                  },
                  userEmail: {
                    description: "Email do administrador",
                    format: "email",
                    type: "string",
                  },
                },
                required: ["file", "domain"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    message: {
                      type: "string",
                    },
                    success: {
                      type: "boolean",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Transferência iniciada com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Arquivo ou domínio inválido",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Transferir instalação WordPress",
        tags: ["WordPress"],
      },
    },
    "/api/wp-install-w": {
      get: {
        description:
          "Instala uma nova instalação WordPress. Retorna Server-Sent Events (SSE) para progresso em tempo real",
        parameters: [
          {
            description: "Domínio onde instalar o WordPress",
            in: "query",
            name: "domain",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            description: "Nome de usuário do administrador",
            in: "query",
            name: "admin_username",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            description: "Senha do administrador",
            in: "query",
            name: "admin_password",
            required: true,
            schema: {
              format: "password",
              type: "string",
            },
          },
          {
            description: "Nome do site",
            in: "query",
            name: "site_name",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            description: "Email do administrador",
            in: "query",
            name: "admin_email",
            required: false,
            schema: {
              format: "email",
              type: "string",
            },
          },
          {
            description: "Plugins a serem instalados (separados por vírgula)",
            in: "query",
            name: "plugins",
            required: false,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            content: {
              "text/event-stream": {
                schema: {
                  description:
                    "Server-Sent Events stream com progresso da instalação",
                  type: "string",
                },
              },
            },
            description: "Stream de eventos SSE com progresso da instalação",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Parâmetros inválidos",
          },
          401: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Não autorizado",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        summary: "Instalar WordPress",
        tags: ["Instalação"],
      },
    },
    "/sites/edit": {
      get: {
        description:
          "Obtém token JWT e redireciona para a página de edição do Elementor no WordPress",
        parameters: [
          {
            description: "URL do site WordPress",
            in: "query",
            name: "site",
            required: true,
            schema: {
              format: "uri",
              type: "string",
            },
          },
        ],
        responses: {
          302: {
            description: "Redirecionamento para página de edição do Elementor",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Parâmetro site não fornecido ou inválido",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro ao obter token JWT",
          },
        },
        summary: "Editar site WordPress",
        tags: ["Sites"],
      },
    },
    "/webhook/dom": {
      post: {
        description:
          "Recebe webhooks do sistema de pagamento para processar eventos relacionados a assinaturas, faturas e registro de domínios",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                properties: {
                  data: {
                    properties: {
                      external_reference: {
                        description:
                          "ID da referência externa (invoice ID, etc)",
                        type: "string",
                      },
                      metadata: {
                        properties: {
                          whoisguard: {
                            description: "Se o WhoisGuard está ativado",
                            type: "string",
                          },
                          years: {
                            description: "Anos de registro do domínio",
                            type: "string",
                          },
                        },
                        type: "object",
                      },
                    },
                    required: ["external_reference"],
                    type: "object",
                  },
                  event: {
                    description: "Tipo de evento do webhook",
                    enum: [
                      "SIGNATURE-CREATED",
                      "SIGNATURE-CANCELLED",
                      "SIGNATURE-INVOICE-CREATED",
                      "SIGNATURE-INVOICE-PAID",
                      "CHARGE-APPROVED",
                    ],
                    type: "string",
                  },
                },
                required: ["event", "data"],
                type: "object",
              },
            },
          },
          required: true,
        },
        responses: {
          200: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    actionTaken: {
                      description: "Descrição da ação tomada",
                      type: "string",
                    },
                    details: {
                      description: "Detalhes do processamento",
                      type: "object",
                    },
                    message: {
                      type: "string",
                    },
                    success: {
                      type: "boolean",
                    },
                    timestamp: {
                      format: "date-time",
                      type: "string",
                    },
                    webhookType: {
                      description: "Tipo de evento processado",
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Webhook processado com sucesso",
          },
          400: {
            content: {
              "application/json": {
                schema: {
                  properties: {
                    error: {
                      properties: {
                        message: {
                          type: "string",
                        },
                        stack: {
                          type: "string",
                        },
                      },
                      type: "object",
                    },
                    message: {
                      type: "string",
                    },
                    success: {
                      type: "boolean",
                    },
                    timestamp: {
                      format: "date-time",
                      type: "string",
                    },
                  },
                  type: "object",
                },
              },
            },
            description: "Payload inválido ou erro no processamento",
          },
          500: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
            description: "Erro interno do servidor",
          },
        },
        summary: "Webhook de pagamento e domínios",
        tags: ["Webhooks"],
      },
    },
  },
  servers: [
    {
      description: "Servidor de desenvolvimento",
      url: "http://localhost:3000",
    },
    {
      description: "Servidor de produção",
      url: "https://atlashosting.com.br",
    },
  ],
  tags: [
    {
      description: "Endpoints para autenticação e gerenciamento de usuários",
      name: "Autenticação",
    },
    {
      description: "Endpoints para gerenciamento de instalações WordPress",
      name: "WordPress",
    },
    {
      description: "Endpoints para gerenciamento de sites e instâncias",
      name: "Sites",
    },
    {
      description: "Endpoints para verificação e gerenciamento de DNS",
      name: "DNS",
    },
    {
      description: "Endpoints para download de recursos",
      name: "Downloads",
    },
    {
      description: "Endpoints administrativos",
      name: "Admin",
    },
    {
      description: "Endpoints para instalação de WordPress",
      name: "Instalação",
    },
    {
      description: "Endpoints para gerenciamento de usuários",
      name: "Usuário",
    },
    {
      description: "Endpoints para autenticação OAuth (GitHub, Google)",
      name: "OAuth",
    },
    {
      description: "Endpoints para recebimento de webhooks externos",
      name: "Webhooks",
    },
    {
      description: "Endpoints para gerenciamento de sites e edição",
      name: "Sites",
    },
    {
      description:
        "Endpoints para telemetria e gerenciamento de servidores VPS",
      name: "VPS",
    },
  ],
};
