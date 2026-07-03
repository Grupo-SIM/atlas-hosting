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
} from '@react-email/components';

interface AtlasWelcomeEmailProps {
  firstName?: string;
  organizationName?: string;
  dashboardUrl?: string;
  supportEmail?: string;
  publicSiteUrl?: string;
}

const baseUrlLocal = 'https://atlashosting.com.br';

export const AtlasWelcomeEmail = ({
  firstName = 'there',
  organizationName = 'Your Organization',
  dashboardUrl = 'https://atlashosting.com.br/home',
  supportEmail = 'support@atlashosting.com',
  publicSiteUrl = baseUrlLocal,
}: AtlasWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bem-vindo ao Atlas Hosting! Sua jornada começa aqui.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src="cid:atlaslogo"
            width="120"
            height="40"
            alt="Atlas Hosting"
            style={logo}
          />
          <Hr style={hr} />
          <Heading style={heading}>
            Bem-vindo ao Atlas Hosting, {firstName}!
          </Heading>
          <Text style={paragraph}>
            Estamos muito felizes em ter você na família Atlas Hosting! Sua conta para{' '}
            <strong>{organizationName}</strong> foi criada com sucesso, e você já está pronto para começar a hospedar seus sites com facilidade.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
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
  firstName: 'Breno',
  organizationName: 'Atlas Hosting',
  dashboardUrl: 'https://atlashosting.com.br/home',
  supportEmail: 'contact@atlashosting.com.br',
  publicSiteUrl: 'https://atlashosting.com.br',
} as AtlasWelcomeEmailProps;

export default AtlasWelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const box = {
  padding: '0 48px',
};

const logo = {
  margin: '0 auto',
  display: 'block',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '0 0 20px',
};





const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
  lineHeight: '1.5',
  border: 'none',
};

const anchor = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '32px',
  textAlign: 'left' as const,
};
