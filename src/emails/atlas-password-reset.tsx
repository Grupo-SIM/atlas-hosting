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

interface AtlasPasswordResetEmailProps {
  firstName?: string;
  email?: string;
  resetLink?: string;
  resetCode?: string;
  expirationTime?: string;
  supportEmail?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const AtlasPasswordResetEmail = ({
  firstName = 'there',
  email = 'user@example.com',
  resetLink = 'https://atlashosting.com/reset-password?token=abc123',
  resetCode = 'ABC123',
  expirationTime = '1 hour',
  supportEmail = 'support@atlashosting.com',
}: AtlasPasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your Atlas Hosting password</Preview>
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
            Reset Your Password
          </Heading>
          <Text style={paragraph}>
            Hi {firstName},
          </Text>
          <Text style={paragraph}>
            We received a request to reset the password for your Atlas Hosting account associated with <strong>{email}</strong>.
          </Text>
          <Text style={paragraph}>
            Click the button below to reset your password. This link will expire in {expirationTime}.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset Password
            </Button>
          </Section>
          <Text style={paragraph}>
            If the button doesn't work, you can also copy and paste the following link into your browser:
          </Text>
          <Text style={linkText}>
            <Link style={anchor} href={resetLink}>
              {resetLink}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={paragraph}>
            <strong>Alternative method:</strong> You can also use this reset code:
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{resetCode}</Text>
          </Section>
          <Text style={paragraph}>
            Enter this code on the password reset page to verify your identity.
          </Text>
          <Hr style={hr} />
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure. However, if you're concerned about unauthorized access, please contact our support team immediately.
            </Text>
          </Section>
          <Text style={paragraph}>
            For security reasons, this reset link and code will expire in {expirationTime}. If you need to reset your password after this time, you'll need to request a new reset link.
          </Text>
          <Text style={paragraph}>
            If you continue to have problems, please contact our support team at{' '}
            <Link style={anchor} href={`mailto:${supportEmail}`}>
              {supportEmail}
            </Link>
            .
          </Text>
          <Text style={footer}>
            Best regards,
            <br />
            The Atlas Hosting Security Team
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

AtlasPasswordResetEmail.PreviewProps = {
  firstName: 'John',
  email: 'john@example.com',
  resetLink: 'https://atlashosting.com/reset-password?token=abc123',
  resetCode: 'ABC123',
  expirationTime: '1 hour',
  supportEmail: 'support@atlashosting.com',
} as AtlasPasswordResetEmailProps;

export default AtlasPasswordResetEmail;

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
  backgroundColor: '#dc2626',
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

const linkText = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'left' as const,
  margin: '0 0 20px',
  wordBreak: 'break-all' as const,
};

const codeContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const code = {
  backgroundColor: '#f4f4f5',
  border: '1px solid #e4e4e7',
  borderRadius: '6px',
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  padding: '16px 24px',
  letterSpacing: '2px',
  fontFamily: 'monospace',
  display: 'inline-block',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
};

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
