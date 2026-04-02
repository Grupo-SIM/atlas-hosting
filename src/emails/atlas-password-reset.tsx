import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AtlasPasswordResetEmailProps {
  firstName?: string;
  email?: string;
  resetLink?: string;
  resetCode?: string;
  expirationTime?: string;
  supportEmail?: string;
  /** Base URL do site (logo e consistência com o link de reset). */
  publicSiteUrl?: string;
}

function logoSrc(publicSiteUrl?: string): string {
  const base = publicSiteUrl?.replace(/\/$/, "").trim();
  if (base) {
    return `${base}/static/atlas-logo.png`;
  }
  return "https://atlashosting.com.br/static/atlas-logo.png";
}

export const AtlasPasswordResetEmail = ({
  firstName = "cliente",
  email = "usuario@exemplo.com",
  resetLink = "https://atlashosting.com.br/reset-password?token=abc123",
  resetCode = "000000",
  expirationTime = "1 hora",
  supportEmail = "contact@atlashosting.com.br",
  publicSiteUrl,
}: AtlasPasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefinir senha — Atlas Hosting</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src={logoSrc(publicSiteUrl)}
            width="120"
            height="40"
            alt="Atlas Hosting"
            style={logo}
          />
          <Hr style={hr} />
          <Heading style={heading}>Redefinir sua senha</Heading>
          <Text style={paragraph}>Olá, {firstName},</Text>
          <Text style={paragraph}>
            Recebemos um pedido para redefinir a senha da sua conta Atlas Hosting
            associada a <strong>{email}</strong>.
          </Text>
          <Text style={paragraph}>
            Clique no botão abaixo para criar uma nova senha. Este link expira em{" "}
            {expirationTime}.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Redefinir senha
            </Button>
          </Section>
          <Text style={paragraph}>
            Se o botão não funcionar, copie e cole o link abaixo no navegador:
          </Text>
          <Text style={linkText}>
            <Link style={anchor} href={resetLink}>
              {resetLink}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>Outra opção:</strong> use este código de redefinição:
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{resetCode}</Text>
          </Section>
          <Text style={paragraph}>
            Informe esse código na página de redefinição de senha para confirmar
            que é você.
          </Text>
          <Hr style={hr} />
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Segurança:</strong> se você não pediu esta redefinição,
              ignore este e-mail — sua conta permanece protegida. Se suspeitar de
              acesso indevido, fale com o suporte o quanto antes.
            </Text>
          </Section>
          <Text style={paragraph}>
            Por segurança, o link e o código expiram em {expirationTime}. Depois
            disso, solicite um novo e-mail de redefinição.
          </Text>
          <Text style={paragraph}>
            Precisa de ajuda? Fale com o suporte em{" "}
            <Link style={anchor} href={`mailto:${supportEmail}`}>
              {supportEmail}
            </Link>
            .
          </Text>
          <Text style={footer}>
            Atenciosamente,
            <br />
            Equipe de Segurança — Atlas Hosting
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

AtlasPasswordResetEmail.PreviewProps = {
  firstName: "Breno",
  email: "breno@exemplo.com",
  resetLink: "https://atlashosting.com.br/reset-password?token=abc123",
  resetCode: "54666",
  expirationTime: "1 hora",
  supportEmail: "contact@atlashosting.com.br",
  publicSiteUrl: "https://atlashosting.com.br",
} as AtlasPasswordResetEmailProps;

export default AtlasPasswordResetEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
};

const box = {
  padding: "0 48px",
};

const logo = {
  margin: "0 auto",
  display: "block",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  textAlign: "center" as const,
  margin: "30px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  margin: "0 0 20px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
  lineHeight: "1.5",
  border: "none",
};

const linkText = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "20px",
  textAlign: "left" as const,
  margin: "0 0 20px",
  wordBreak: "break-all" as const,
};

const codeContainer = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const code = {
  backgroundColor: "#f4f4f5",
  border: "1px solid #e4e4e7",
  borderRadius: "6px",
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "600",
  padding: "16px 24px",
  letterSpacing: "2px",
  fontFamily: "monospace",
  display: "inline-block",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "6px",
  padding: "16px",
  margin: "20px 0",
};

const warningText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const anchor = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  marginTop: "32px",
  textAlign: "left" as const,
};
