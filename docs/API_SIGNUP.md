# API - Criação de Conta

Este documento explica como criar uma nova conta de usuário na API do Atlas Hosting.

## Endpoint

```
POST /api/auth/signup
```

## Autenticação

Este endpoint **não requer autenticação**. É público e pode ser acessado por qualquer usuário.

## Campos da Requisição

### Campos Obrigatórios

#### `email` (string, obrigatório)
- **Tipo**: String (formato email)
- **Exemplo**: `"breno@gmail.com"`
- **Descrição**: Email do usuário que será usado para login e comunicação
- **Validações**:
  - Deve ser um formato de email válido
  - Deve ser único no sistema (não pode estar cadastrado)
  - Será convertido para minúsculas antes de ser salvo no banco de dados

#### `password` (string, obrigatório)
- **Tipo**: String
- **Exemplo**: `"123123"`
- **Descrição**: Senha da conta do usuário
- **Validações**:
  - Mínimo de 8 caracteres
  - Máximo de 100 caracteres
  - Será armazenada como hash no banco de dados (nunca em texto plano)

#### `fullName` (string, obrigatório)
- **Tipo**: String
- **Exemplo**: `"Breno Silva"`
- **Descrição**: Nome completo do usuário
- **Validações**:
  - Deve conter pelo menos 2 palavras separadas por espaço
  - Não pode estar vazio
- **Nota**: Exemplos válidos: `"Breno Silva"`, `"Maria da Silva"`. Exemplo inválido: `"breno"` (apenas uma palavra)

#### `organizationName` (string, obrigatório)
- **Tipo**: String
- **Exemplo**: `"zaker"`
- **Descrição**: Nome da organização/empresa do usuário
- **O que acontece**:
  - Uma nova organização é criada no sistema com este nome
  - O usuário é automaticamente definido como administrador da organização
  - Uma carteira (wallet) é criada e vinculada à organização

### Campos Opcionais

#### `referrerId` (string, opcional)
- **Tipo**: String (UUID)
- **Exemplo**: `"clx123abc456def789"`
- **Descrição**: ID do usuário afiliado que indicou este cadastro
- **O que acontece quando fornecido**:
  - O sistema registra o vínculo de afiliado
  - O usuário afiliado recebe uma notificação no sistema
  - Usado para rastrear indicações no sistema de afiliados
- **Nota**: Deve ser um ID válido de um usuário existente no sistema. Se não fornecido, o campo pode ser omitido ou enviado como `null`.

## Exemplo de Requisição

### Requisição Completa

```json
{
  "email": "breno@gmail.com",
  "password": "123123",
  "fullName": "Breno Silva",
  "organizationName": "zaker",
  "referrerId": "clx123abc456def789"
}
```

### Requisição Sem Afiliado

```json
{
  "email": "breno@gmail.com",
  "password": "123123",
  "fullName": "Breno Silva",
  "organizationName": "zaker"
}
```

### Exemplo com cURL

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "breno@gmail.com",
    "password": "123123",
    "fullName": "Breno Silva",
    "organizationName": "zaker"
  }'
```

### Exemplo com JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'breno@gmail.com',
    password: '123123',
    fullName: 'Breno Silva',
    organizationName: 'zaker',
  }),
});

const data = await response.json();
console.log(data);
```

## Respostas

### Sucesso (201 Created)

Quando a conta é criada com sucesso:

```json
{
  "status": "success",
  "message": "Conta criada com sucesso! Verifique seu email para ativar a conta.",
  "user": {
    "id": "clx123abc456def789",
    "name": "Breno Silva",
    "email": "breno@gmail.com"
  }
}
```

**Campos da resposta:**
- `status`: Sempre `"success"` em caso de sucesso
- `message`: Mensagem informativa para o usuário
- `user`: Objeto com informações básicas do usuário criado
  - `id`: ID único do usuário
  - `name`: Nome completo do usuário
  - `email`: Email do usuário

### Erro - Dados Inválidos (400 Bad Request)

Quando os dados enviados não passam na validação:

```json
{
  "status": "error",
  "message": "Dados inválidos",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["email"],
      "message": "Required"
    },
    {
      "code": "too_small",
      "minimum": 8,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "A senha deve ter pelo menos 8 caracteres",
      "path": ["password"]
    }
  ]
}
```

### Erro - Email Já Cadastrado (400 Bad Request)

Quando o email já está em uso:

```json
{
  "status": "error",
  "message": "Este email já está em uso"
}
```

### Erro - Nome Incompleto (400 Bad Request)

Quando o nome não contém pelo menos 2 palavras:

```json
{
  "status": "error",
  "message": "Dados inválidos",
  "errors": [
    {
      "message": "Digite seu nome completo",
      "path": ["fullName"]
    }
  ]
}
```

### Erro - Servidor (500 Internal Server Error)

Quando ocorre um erro interno do servidor:

```json
{
  "error": "Erro interno do servidor"
}
```

## O que acontece após criar a conta?

1. **Usuário criado**: Um novo registro de usuário é criado no banco de dados
2. **Organização criada**: Uma nova organização é criada e vinculada ao usuário
3. **Carteira criada**: Uma carteira (wallet) é criada e vinculada à organização
4. **Configurações padrão**: Configurações padrão de notificações são criadas para o usuário
5. **Email de boas-vindas**: Um email de boas-vindas é enviado automaticamente
6. **Email de verificação**: Um email de verificação é enviado (necessário para ativar a conta)
7. **Notificação de afiliado**: Se `referrerId` foi fornecido, o usuário afiliado recebe uma notificação

## Próximos Passos

Após criar a conta com sucesso:

1. **Verificar Email**: O usuário receberá um email com um token de verificação
2. **Ativar Conta**: Use o endpoint `/api/auth/verify-email` com o token recebido
3. **Fazer Login**: Após verificar o email, o usuário pode fazer login usando `/api/auth` (POST)

## Validações Detalhadas

### Email
- Formato válido de email (regex padrão)
- Não pode estar cadastrado no sistema
- Convertido para minúsculas automaticamente

### Senha
- Mínimo: 8 caracteres
- Máximo: 100 caracteres
- Armazenada como hash (bcrypt)

### Nome Completo
- Deve conter pelo menos 2 palavras
- Exemplos válidos:
  - `"Breno Silva"`
  - `"Maria da Silva"`
  - `"João Pedro Santos"`
- Exemplos inválidos:
  - `"breno"` (apenas uma palavra)
  - `""` (vazio)

### Nome da Organização
- Não pode estar vazio
- Será usado como nome da organização no sistema

### Referrer ID
- Se fornecido, deve ser um ID válido de usuário existente
- Se o ID não existir, a requisição ainda será bem-sucedida, mas o vínculo de afiliado não será criado

## Segurança

- As senhas são armazenadas como hash (nunca em texto plano)
- O email é convertido para minúsculas para evitar duplicatas
- Validações são feitas tanto no cliente quanto no servidor
- Tokens de verificação têm expiração

## Documentação Adicional

- [Sistema de Autenticação](./AUTH_SYSTEM.md)
- [Documentação Completa da API](../src/lib/swagger/config.ts)
- [Swagger UI](/api-docs)

## Suporte

Para mais informações ou suporte, entre em contato com: support@atlashosting.com.br

