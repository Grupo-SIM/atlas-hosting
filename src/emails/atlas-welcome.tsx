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
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const AtlasWelcomeEmail = ({
  firstName = 'there',
  organizationName = 'Your Organization',
  dashboardUrl = 'https://atlashosting.com.br/home',
  supportEmail = 'support@atlashosting.com',
}: AtlasWelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Atlas Hosting! Your hosting journey starts here.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src={`${baseUrl}/static/atlas-logo.png`}
            width="120"
            height="40"
            alt="Atlas Hosting"
            style={logo}
          />
          <Hr style={hr} />
          <Heading style={heading}>
            Welcome to Atlas Hosting, {firstName}!
          </Heading>
          <Text style={paragraph}>
            We're thrilled to have you join the Atlas Hosting family! Your account for{' '}
            <strong>{organizationName}</strong> has been successfully created, and you're now ready to start hosting your websites with ease.
          </Text>
          <Text style={paragraph}>
            Here's what you can do next:
          </Text>
          <Section style={bulletPoints}>
            <Text style={bulletPoint}>
              🚀 <strong>Deploy your first website</strong> - Upload your files and get online in minutes
            </Text>
            <Text style={bulletPoint}>
              🌐 <strong>Manage your domains</strong> - Connect your existing domains or register new ones
            </Text>
            <Text style={bulletPoint}>
              📊 <strong>Monitor your sites</strong> - Track performance and uptime from your dashboard
            </Text>
            <Text style={bulletPoint}>
              💳 <strong>Manage billing</strong> - View usage and manage your subscription
            </Text>
          </Section>
          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Access Your Dashboard
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={paragraph}>
            Need help getting started? Check out our{' '}
            <Link style={anchor} href="https://docs.atlashosting.com">
              documentation
            </Link>{' '}
            or{' '}
            <Link style={anchor} href="https://atlashosting.com/tutorials">
              video tutorials
            </Link>{' '}
            to make the most of your hosting experience.
          </Text>
          <Text style={paragraph}>
            If you have any questions or need assistance, don't hesitate to reach out to our support team at{' '}
            <Link style={anchor} href={`mailto:${supportEmail}`}>
              {supportEmail}
            </Link>
            . We're here to help you succeed!
          </Text>
          <Text style={footer}>
            Welcome aboard,
            <br />
            The Atlas Hosting Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

AtlasWelcomeEmail.PreviewProps = {
  firstName: 'John',
  organizationName: 'Acme Corp',
  dashboardUrl: 'https://atlashosting.com.br/home',
  supportEmail: 'support@atlashosting.com',
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

const bulletPoints = {
  margin: '20px 0',
};

const bulletPoint = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '0 0 12px',
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
