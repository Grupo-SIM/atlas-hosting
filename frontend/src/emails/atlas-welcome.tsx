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

interface AtlasWelcomeEmailProps {
  firstName?: string;
  organizationName?: string;
  dashboardUrl?: string;
  supportEmail?: string;
  publicSiteUrl?: string;
}

const baseUrlLocal = "https://atlashosting.com.br";

export const AtlasWelcomeEmail = ({
  firstName = "there",
  organizationName = "Your Organization",
  dashboardUrl = "https://atlashosting.com.br/home",
  supportEmail = "support@atlashosting.com",
  publicSiteUrl = baseUrlLocal,
}: AtlasWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao Atlas Hosting! Sua jornada começa aqui.</Preview>
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
          <Heading style={heading}>
            Bem-vindo ao Atlas Hosting, {firstName}!
          </Heading>
          <Text style={paragraph}>
            Estamos muito felizes em ter você na família Atlas Hosting! Sua
            conta para <strong>{organizationName}</strong> foi criada com
            sucesso, e você já está pronto para começar a hospedar seus sites
            com facilidade.
          </Text>

          <Section style={buttonContainer}>
            <Button href={dashboardUrl} style={button}>
              Acessar seu Painel
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Bem-vindo a bordo,
            <br />
            Equipe Atlas Hosting
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

AtlasWelcomeEmail.PreviewProps = {
  dashboardUrl: "https://atlashosting.com.br/home",
  firstName: "Breno",
  organizationName: "Atlas Hosting",
  publicSiteUrl: "https://atlashosting.com.br",
  supportEmail: "contact@atlashosting.com.br",
} as AtlasWelcomeEmailProps;

export default AtlasWelcomeEmail;

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
  backgroundColor: "#2563eb",
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
