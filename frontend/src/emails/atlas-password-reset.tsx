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
  expirationTime?: string;
  supportEmail?: string;
  /** Base URL do site (logo e consistência com o link de reset). */
  publicSiteUrl?: string;
}

export const AtlasPasswordResetEmail = ({
  firstName = "cliente",
  email = "usuario@exemplo.com",
  resetLink = "https://atlashosting.com.br/reset-password?token=abc123",
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
            alt="Atlas Hosting"
            height="40"
            src="cid:atlaslogo"
            style={logo}
            width="120"
          />
          <Hr style={hr} />
          <Heading style={heading}>Redefinir sua senha</Heading>
          <Text style={paragraph}>Olá, {firstName},</Text>
          <Text style={paragraph}>
            Recebemos um pedido para redefinir a senha da sua conta Atlas
            Hosting associada a <strong>{email}</strong>.
          </Text>
          <Text style={paragraph}>
            Clique no botão abaixo para criar uma nova senha. Este link expira
            em {expirationTime}.
          </Text>
          <Section style={buttonContainer}>
            <Button href={resetLink} style={button}>
              Redefinir senha
            </Button>
          </Section>
          <Text style={paragraph}>
            Se o botão não funcionar, copie e cole o link abaixo no navegador:
          </Text>
          <Text style={linkText}>
            <Link href={resetLink} style={anchor}>
              {resetLink}
            </Link>
          </Text>
          <Hr style={hr} />
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Segurança:</strong> se você não pediu esta redefinição,
              ignore este e-mail — sua conta permanece protegida. Se suspeitar
              de acesso indevido, fale com o suporte o quanto antes.
            </Text>
          </Section>
          <Text style={paragraph}>
            Por segurança, o link expira em {expirationTime}. Depois disso,
            solicite um novo e-mail de redefinição.
          </Text>
          <Text style={paragraph}>
            Precisa de ajuda? Fale com o suporte em{" "}
            <Link href={`mailto:${supportEmail}`} style={anchor}>
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
  email: "breno@exemplo.com",
  expirationTime: "1 hora",
  firstName: "Breno",
  publicSiteUrl: "https://atlashosting.com.br",
  resetLink: "https://atlashosting.com.br/reset-password?token=abc123",
  supportEmail: "contact@atlashosting.com.br",
} as AtlasPasswordResetEmailProps;

export default AtlasPasswordResetEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  maxWidth: "580px",
  padding: "20px 0 48px",
};

const box = {
  padding: "0 48px",
};

const logo = {
  display: "block",
  margin: "0 auto",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const heading = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  margin: "30px 0",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
  textAlign: "left" as const,
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#dc2626",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1.5",
  padding: "12px 32px",
  textAlign: "center" as const,
  textDecoration: "none",
};

const linkText = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 20px",
  textAlign: "left" as const,
  wordBreak: "break-all" as const,
};

const codeContainer = {
  margin: "20px 0",
  textAlign: "center" as const,
};

const code = {
  backgroundColor: "#f4f4f5",
  border: "1px solid #e4e4e7",
  borderRadius: "6px",
  color: "#1a1a1a",
  display: "inline-block",
  fontFamily: "monospace",
  fontSize: "18px",
  fontWeight: "600",
  letterSpacing: "2px",
  padding: "16px 24px",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "6px",
  margin: "20px 0",
  padding: "16px",
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
