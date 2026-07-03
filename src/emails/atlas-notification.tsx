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

type NotificationSeverity = 'success' | 'info' | 'warning' | 'danger';

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

const baseUrlLocal = 'https://atlashosting.com.br';

const severityConfig = {
  success: {
    icon: '✅',
    color: '#10b981',
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    buttonColor: '#10b981',
  },
  info: {
    icon: 'ℹ️',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
    buttonColor: '#2563eb',
  },
  warning: {
    icon: '⚠️',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    buttonColor: '#f59e0b',
  },
  danger: {
    icon: '🚨',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    borderColor: '#dc2626',
    buttonColor: '#dc2626',
  },
};

export const AtlasNotificationEmail = ({
  firstName = 'Cliente',
  organizationName = 'Atlas Hosting',
  title = 'Notificação do Sistema',
  message = 'Esta é uma notificação do sistema Atlas Hosting.',
  severity = 'info',
  actionUrl,
  actionText = 'Ver Detalhes',
  timestamp = new Date().toLocaleString('pt-BR'),
  supportEmail = 'contact@atlashosting.com.br',
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
              src="cid:atlaslogo"
              width="120"
              height="40"
              alt="Atlas Hosting"
              style={logo}
            />
            <Hr style={hr} />
            
            <Section style={{
              ...alertBox,
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
            }}>
              <Heading style={{
                ...heading,
                color: config.color,
              }}>
                {config.icon} {title}
              </Heading>
            </Section>

            {!hideGreeting && (
              <Text style={paragraph}>
                Olá {firstName},
              </Text>
            )}
            
            {!hideIntro && (
              <Text style={paragraph}>
                Estamos entrando em contato para informar sobre uma atualização importante na sua conta Atlas Hosting para <strong>{organizationName}</strong>.
              </Text>
            )}
            
            <div 
              style={paragraph} 
              dangerouslySetInnerHTML={{ 
                __html: /<[a-z][\s\S]*>/i.test(message) 
                  ? message 
                  : message.replace(/\n/g, '<br />') 
              }} 
            />

            {additionalInfo && (
              <Section style={{
                ...infoBox,
                backgroundColor: '#f8fafc',
                borderColor: '#e2e8f0',
              }}>
                <Text style={infoText}>
                  <strong>Informações Adicionais:</strong>
                </Text>
                <Text style={infoText}>
                  {additionalInfo}
                </Text>
              </Section>
            )}

            {verificationCode && (
              <Section style={codeContainer}>
                <Text style={codeStyle}>{verificationCode}</Text>
              </Section>
            )}

            {actionUrl && (
              <Section style={buttonContainer}>
                <Button style={{
                  ...button,
                  backgroundColor: config.buttonColor,
                }} href={actionUrl}>
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
                • <strong>Tipo:</strong> {severity.charAt(0).toUpperCase() + severity.slice(1)}
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
  firstName: 'Breno',
  organizationName: 'Atlas Hosting',
  title: 'Implantação de Site Concluída',
  message: 'Seu site foi implantado com sucesso para produção. Todos os sistemas estão funcionando normalmente.',
  severity: 'success' as NotificationSeverity,
  actionUrl: 'https://atlashosting.com.br/home',
  actionText: 'Ver Painel',
  timestamp: new Date().toLocaleString('pt-BR'),
  supportEmail: 'contact@atlashosting.com.br',
  publicSiteUrl: 'https://atlashosting.com.br',
  additionalInfo: 'O deploy levou 2 minutos e 34 segundos. Nenhum erro detectado.',
} as AtlasNotificationEmailProps;

export default AtlasNotificationEmail;

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
  fontSize: '20px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  margin: '0 0 20px',
};

const alertBox = {
  border: '2px solid',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const infoBox = {
  border: '1px solid',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
};

const infoText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
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

const metadataBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
};

const metadataText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const codeContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const codeStyle = {
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
