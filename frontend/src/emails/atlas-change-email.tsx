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

interface AtlasChangeEmailProps {
  firstName?: string;
  currentEmail?: string;
  newEmail?: string;
  verificationLink?: string;
  expirationTime?: string;
  supportEmail?: string;
  publicSiteUrl?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "https://atlashosting.com.br";

export const AtlasChangeEmail = ({
  firstName = "Cliente",
  currentEmail = "email@atual.com",
  newEmail = "novo@email.com",
  verificationLink = "#",
  expirationTime = "24 horas",
  supportEmail = "contact@atlashosting.com.br",
  publicSiteUrl = baseUrl,
}: AtlasChangeEmailProps) => {
  const previewText = `Confirme a alteração do seu email para ${newEmail}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              alt="Atlas Hosting"
              height="40"
              src="cid:atlaslogo"
              style={logo}
              width="120"
            />
          </Section>

          <Section style={content}>
            <Heading style={heading}>Confirmar Alteração de Email</Heading>

            <Text style={paragraph}>Olá {firstName},</Text>

            <Text style={paragraph}>
              Você solicitou a alteração do endereço de email da sua conta Atlas
              Hosting.
            </Text>

            <Section style={emailChangeInfo}>
              <Text style={infoLabel}>Email atual:</Text>
              <Text style={infoValue}>{currentEmail}</Text>

              <Text style={infoLabel}>Novo email:</Text>
              <Text style={infoValue}>{newEmail}</Text>
            </Section>

            <Text style={paragraph}>
              Para confirmar esta alteração, clique no botão abaixo. Seu email
              será alterado somente após a confirmação.
            </Text>

            <Section style={buttonContainer}>
              <Button href={verificationLink} style={button}>
                Confirmar Alteração
              </Button>
            </Section>

            <Text style={paragraph}>
              Ou copie e cole este link no seu navegador:
            </Text>
            <Link href={verificationLink} style={link}>
              {verificationLink}
            </Link>

            <Hr style={hr} />

            <Section style={warningSection}>
              <Text style={warningText}>
                ⚠️ <strong>Importante:</strong> Este link expira em{" "}
                {expirationTime}.
              </Text>
              <Text style={warningText}>
                Se você não solicitou esta alteração, ignore este email ou entre
                em contato conosco imediatamente.
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Atenciosamente,
              <br />
              Equipe Atlas Hosting
            </Text>

            <Text style={footerLink}>
              Precisa de ajuda? Entre em contato:{" "}
              <Link href={`mailto:${supportEmail}`} style={link}>
                {supportEmail}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AtlasChangeEmail;

// Styles
const main = {
  backgroundColor: "#ffffff",
  fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #eee",
  borderRadius: "5px",
  boxShadow: "0 5px 10px rgba(20, 50, 70, 0.2)",
  margin: "0 auto",
  marginTop: "20px",
  maxWidth: "600px",
  padding: "68px 0 130px",
};

const header = {
  backgroundColor: "#f8f9fa",
  padding: "20px 0",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "5px 20px 10px 20px",
};

const heading = {
  color: "#888888",
  fontSize: "32px",
  fontWeight: "300",
  margin: "30px 0",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#484848",
  fontSize: "18px",
  lineHeight: "1.4",
  margin: "24px 0",
};

const emailChangeInfo = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "20px",
};

const infoLabel = {
  color: "#6c757d",
  fontSize: "14px",
  fontWeight: "600",
  margin: "8px 0 4px 0",
};

const infoValue = {
  backgroundColor: "#ffffff",
  border: "1px solid #dee2e6",
  borderRadius: "4px",
  color: "#495057",
  fontSize: "16px",
  fontWeight: "500",
  margin: "0 0 16px 0",
  padding: "8px 12px",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#007bff",
  borderRadius: "3px",
  color: "#fff",
  display: "block",
  fontSize: "18px",
  fontWeight: "600",
  padding: "12px 24px",
  textAlign: "center" as const,
  textDecoration: "none",
};

const link = {
  color: "#007bff",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e9ecef",
  margin: "24px 0",
};

const warningSection = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "8px",
  margin: "24px 0",
  padding: "16px",
};

const warningText = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "1.4",
  margin: "8px 0",
};

const footer = {
  color: "#484848",
  fontSize: "18px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#b4becc",
  fontSize: "14px",
  margin: "12px 0",
  textAlign: "center" as const,
};
