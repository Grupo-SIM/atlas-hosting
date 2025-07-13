# Sistema de Redefinição de Senha e Verificação de Email

Este sistema fornece funcionalidades completas de redefinição de senha e verificação de email para o Atlas Hosting, integrado com os templates React Email.

## Funcionalidades

### 🔐 Sistema de Redefinição de Senha
- Solicitação de redefinição de senha via email
- Tokens seguros com expiração de 1 hora
- Códigos de verificação alternativos
- Validação robusta de senhas
- Proteção contra enumeração de emails

### ✉️ Sistema de Verificação de Email
- Verificação obrigatória de email para novos usuários
- Tokens de verificação com expiração de 24 horas
- Reenvio de emails de verificação
- Bloqueio de login para emails não verificados
- Interface intuitiva para verificação

### 📧 Templates de Email
- Email de boas-vindas com design profissional
- Email de redefinição de senha com botão e link
- Email de verificação com design responsivo
- Templates de notificação com diferentes severidades

## Estrutura do Sistema

### Tabelas do Banco de Dados

```sql
-- Tokens de redefinição de senha
CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamp NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Tokens de verificação de email
CREATE TABLE email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  email text NOT NULL,
  expires_at timestamp NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);
```

### Rotas da API

#### Redefinição de Senha
- `POST /api/auth/request-password-reset` - Solicita redefinição de senha
- `POST /api/auth/reset-password` - Confirma nova senha com token

#### Verificação de Email
- `POST /api/auth/verify-email` - Verifica email com token
- `POST /api/auth/resend-verification` - Reenvia email de verificação

#### Manutenção
- `POST /api/admin/cleanup-tokens` - Remove tokens expirados

### Páginas

#### Autenticação
- `/forgot-password` - Formulário para solicitar redefinição
- `/reset-password?token=...` - Formulário para nova senha
- `/verify-email?token=...` - Página de verificação de email

## Fluxos de Uso

### Cadastro de Novo Usuário
1. Usuário preenche formulário de cadastro
2. Sistema cria conta sem verificação de email
3. Emails de boas-vindas e verificação são enviados
4. Usuário é redirecionado para página de verificação
5. Login é bloqueado até verificação do email

### Redefinição de Senha
1. Usuário clica em "Esqueci minha senha" no login
2. Digita email e solicita redefinição
3. Recebe email com link e código de segurança
4. Acessa link ou usa código para redefinir
5. Define nova senha e faz login

### Verificação de Email
1. Usuário recebe email após cadastro
2. Clica no link de verificação
3. Email é automaticamente verificado
4. Usuário pode fazer login normalmente

## Componentes

### Formulários
- `ForgotPasswordForm` - Solicitar redefinição de senha
- `ResetPasswordForm` - Definir nova senha
- `EmailVerificationForm` - Verificar email ou reenviar

### Proteção
- `EmailVerificationGuard` - Bloqueia acesso a usuários não verificados

### Templates de Email
- `AtlasWelcomeEmail` - Boas-vindas para novos usuários
- `AtlasPasswordResetEmail` - Redefinição de senha
- `AtlasNotificationEmail` - Notificações gerais (incluindo verificação)

## Segurança

### Tokens
- Gerados com 32 bytes de entropia criptográfica
- Únicos no banco de dados
- Marcados como usados após utilização
- Expiração automática (1h para senha, 24h para email)

### Validações
- Verificação de força de senha (mínimo 8 caracteres)
- Proteção contra ataques de timing
- Limpeza automática de tokens expirados
- Prevenção de enumeração de emails

### Headers de Segurança
- Tokens enviados via HTTPS em produção
- Cookies seguros com flags apropriadas
- Validação de origem das requisições

## Configuração

### Variáveis de Ambiente
```env
# Email Configuration
EMAIL_FROM=noreply@atlashosting.com
EMAIL_REPLY_TO=support@atlashosting.com
EMAIL_PROVIDER=smtp|sendgrid|resend|ses
EMAIL_API_KEY=your_api_key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASSWORD=your_password

# App Configuration
NEXT_PUBLIC_BASE_URL=https://atlashosting.com
```

### Instalação
1. Execute a migração do banco de dados:
   ```bash
   psql -d atlas_hosting < drizzle/001_add_auth_tokens.sql
   ```

2. Configure as variáveis de ambiente para email

3. Instale as dependências do React Email:
   ```bash
   cd react-email-starter
   npm install
   ```

## Manutenção

### Limpeza de Tokens
Execute periodicamente para remover tokens expirados:
```bash
curl -X POST https://your-domain.com/api/admin/cleanup-tokens
```

### Monitoramento
- Monitore logs de erro em `/var/log/atlas-hosting/`
- Verifique entregas de email
- Acompanhe métricas de verificação de email

## Personalização

### Templates de Email
Os templates podem ser customizados em:
- `react-email-starter/emails/atlas-welcome.tsx`
- `react-email-starter/emails/atlas-password-reset.tsx`
- `react-email-starter/emails/atlas-notification.tsx`

### Textos da Interface
Todos os textos estão em português brasileiro e podem ser alterados nos componentes React.

### Tempos de Expiração
Ajuste em `src/lib/auth/tokens.ts`:
- Redefinição de senha: `1000 * 60 * 60` (1 hora)
- Verificação de email: `1000 * 60 * 60 * 24` (24 horas)

## Troubleshooting

### Emails não chegam
1. Verifique configuração SMTP
2. Confirme variáveis de ambiente
3. Verifique spam/lixo eletrônico
4. Teste configuração de email

### Token inválido ou expirado
1. Solicite novo token
2. Verifique se não foi usado anteriormente
3. Confirme que não expirou

### Verificação não funciona
1. Verifique se email existe no banco
2. Confirme que token não foi usado
3. Teste fluxo completo de verificação
