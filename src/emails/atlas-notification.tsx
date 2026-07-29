import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type NotificationSeverity = "success" | "info" | "warning" | "danger";

interface AtlasNotificationEmailProps {
  firstName?: string;
  organizationName?: string;
  title?: string;
  message?: string;
  severity?: NotificationSeverity;
  actionUrl?: string;
  actionText?: string;
  timestamp?: string;
  supportEmail?: string;
  additionalInfo?: string;
  publicSiteUrl?: string;
  verificationCode?: string;
  hideGreeting?: boolean;
  hideIntro?: boolean;
}

const baseUrlLocal = "https://atlashosting.com.br";

const severityConfig = {
  danger: {
    backgroundColor: "#fef2f2",
    borderColor: "#dc2626",
    buttonColor: "#dc2626",
    color: "#dc2626",
    icon: "🚨",
  },
  info: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
    buttonColor: "#2563eb",
    color: "#2563eb",
    icon: "ℹ️",
  },
  success: {
    backgroundColor: "#ecfdf5",
    borderColor: "#10b981",
    buttonColor: "#10b981",
    color: "#10b981",
    icon: "✅",
  },
  warning: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
    buttonColor: "#f59e0b",
    color: "#f59e0b",
    icon: "⚠️",
  },
};

export const AtlasNotificationEmail = ({
  firstName = "Cliente",
  organizationName = "Atlas Hosting",
  title = "Notificação do Sistema",
  message = "Esta é uma notificação do sistema Atlas Hosting.",
  severity = "info",
  actionUrl,
  actionText = "Ver Detalhes",
  timestamp = new Date().toLocaleString("pt-BR"),
  supportEmail = "contact@atlashosting.com.br",
  additionalInfo,
  publicSiteUrl = baseUrlLocal,
  verificationCode,
  hideGreeting = false,
  hideIntro = false,
}: AtlasNotificationEmailProps) => {
  const config = severityConfig[severity];
  const previewText = `${config.icon} ${title}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
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

            <Section
              style={{
                ...alertBox,
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
              }}
            >
              <Heading
                style={{
                  ...heading,
                  color: config.color,
                }}
              >
                {config.icon} {title}
              </Heading>
            </Section>

            {!hideGreeting && <Text style={paragraph}>Olá {firstName},</Text>}

            {!hideIntro && (
              <Text style={paragraph}>
                Estamos entrando em contato para informar sobre uma atualização
                importante na sua conta Atlas Hosting para{" "}
                <strong>{organizationName}</strong>.
              </Text>
            )}

            <div
              dangerouslySetInnerHTML={{
                __html: /<[a-z][\s\S]*>/i.test(message)
                  ? message
                  : message.replace(/\n/g, "<br />"),
              }}
              style={paragraph}
            />

            {additionalInfo && (
              <Section
                style={{
                  ...infoBox,
                  backgroundColor: "#f8fafc",
                  borderColor: "#e2e8f0",
                }}
              >
                <Text style={infoText}>
                  <strong>Informações Adicionais:</strong>
                </Text>
                <Text style={infoText}>{additionalInfo}</Text>
              </Section>
            )}

            {verificationCode && (
              <Section style={codeContainer}>
                <Text style={codeStyle}>{verificationCode}</Text>
              </Section>
            )}

            {actionUrl && (
              <Section style={buttonContainer}>
                <Button
                  href={actionUrl}
                  style={{
                    ...button,
                    backgroundColor: config.buttonColor,
                  }}
                >
                  {actionText}
                </Button>
              </Section>
            )}

            <Hr style={hr} />

            <Section style={metadataBox}>
              <Text style={metadataText}>
                <strong>Detalhes da Notificação:</strong>
              </Text>
              <Text style={metadataText}>
                • <strong>Tipo:</strong>{" "}
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Text>
              <Text style={metadataText}>
                • <strong>Data/Hora:</strong> {timestamp}
              </Text>
              <Text style={metadataText}>
                • <strong>Organização:</strong> {organizationName}
              </Text>
            </Section>

            <Text style={footer}>
              Atenciosamente,
              <br />
              Equipe Atlas Hosting
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

AtlasNotificationEmail.PreviewProps = {
  actionText: "Ver Painel",
  actionUrl: "https://atlashosting.com.br/home",
  additionalInfo:
    "O deploy levou 2 minutos e 34 segundos. Nenhum erro detectado.",
  firstName: "Breno",
  message:
    "Seu site foi implantado com sucesso para produção. Todos os sistemas estão funcionando normalmente.",
  organizationName: "Atlas Hosting",
  publicSiteUrl: "https://atlashosting.com.br",
  severity: "success" as NotificationSeverity,
  supportEmail: "contact@atlashosting.com.br",
  timestamp: new Date().toLocaleString("pt-BR"),
  title: "Implantação de Site Concluída",
} as AtlasNotificationEmailProps;

export default AtlasNotificationEmail;

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
  fontSize: "20px",
  fontWeight: "600",
  margin: "0",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
  textAlign: "left" as const,
};

const alertBox = {
  border: "2px solid",
  borderRadius: "8px",
  margin: "20px 0",
  padding: "20px",
  textAlign: "center" as const,
};

const infoBox = {
  border: "1px solid",
  borderRadius: "6px",
  margin: "20px 0",
  padding: "16px",
};

const infoText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
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

const metadataBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  margin: "20px 0",
  padding: "16px",
};

const metadataText = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px",
};

const codeContainer = {
  margin: "20px 0",
  textAlign: "center" as const,
};

const codeStyle = {
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
