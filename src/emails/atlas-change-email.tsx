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
  : 'https://atlashosting.com.br';

export const AtlasChangeEmail = ({
  firstName = 'Cliente',
  currentEmail = 'email@atual.com',
  newEmail = 'novo@email.com',
  verificationLink = '#',
  expirationTime = '24 horas',
  supportEmail = 'contact@atlashosting.com.br',
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
              src={`${publicSiteUrl}/atlas-logo.png`}
              width="120"
              height="40"
              alt="Atlas Hosting"
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Heading style={heading}>Confirmar Alteração de Email</Heading>
            
            <Text style={paragraph}>
              Olá {firstName},
            </Text>
            
            <Text style={paragraph}>
              Você solicitou a alteração do endereço de email da sua conta Atlas Hosting.
            </Text>

            <Section style={emailChangeInfo}>
              <Text style={infoLabel}>Email atual:</Text>
              <Text style={infoValue}>{currentEmail}</Text>
              
              <Text style={infoLabel}>Novo email:</Text>
              <Text style={infoValue}>{newEmail}</Text>
            </Section>

            <Text style={paragraph}>
              Para confirmar esta alteração, clique no botão abaixo. Seu email será 
              alterado somente após a confirmação.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={verificationLink}>
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
                ⚠️ <strong>Importante:</strong> Este link expira em {expirationTime}.
              </Text>
              <Text style={warningText}>
                Se você não solicitou esta alteração, ignore este email ou 
                entre em contato conosco imediatamente.
              </Text>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Atenciosamente,<br />
              Equipe Atlas Hosting
            </Text>

            <Text style={footerLink}>
              Precisa de ajuda? Entre em contato:{' '}
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
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20, 50, 70, 0.2)',
  marginTop: '20px',
  maxWidth: '600px',
  margin: '0 auto',
  padding: '68px 0 130px',
};

const header = {
  backgroundColor: '#f8f9fa',
  padding: '20px 0',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '5px 20px 10px 20px',
};

const heading = {
  fontSize: '32px',
  fontWeight: '300',
  color: '#888888',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const paragraph = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#484848',
  margin: '24px 0',
};

const emailChangeInfo = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoLabel = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6c757d',
  margin: '8px 0 4px 0',
};

const infoValue = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#495057',
  margin: '0 0 16px 0',
  padding: '8px 12px',
  backgroundColor: '#ffffff',
  border: '1px solid #dee2e6',
  borderRadius: '4px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '18px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  fontWeight: '600',
};

const link = {
  color: '#007bff',
  textDecoration: 'underline',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e9ecef',
  margin: '24px 0',
};

const warningSection = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  fontSize: '14px',
  lineHeight: '1.4',
  color: '#856404',
  margin: '8px 0',
};

const footer = {
  fontSize: '18px',
  color: '#484848',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const footerLink = {
  fontSize: '14px',
  color: '#b4becc',
  textAlign: 'center' as const,
  margin: '12px 0',
};
