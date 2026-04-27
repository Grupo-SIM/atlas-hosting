'use client';

import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const WEBHOOK_URL = 'https://bot.jbmidia.com/webhook/6229f9db-8b7f-40ad-8a71-503727e71c34/chat';

export function N8nChatBubble() {
  useEffect(() => {
    createChat({
      webhookUrl: WEBHOOK_URL,
      mode: 'window',
      target: '#n8n-chat-bubble',
      initialMessages: [
        'Olá! 👋',
        'Sou o Atlas, assistente da Atlas Hosting. Como posso te ajudar?',
      ],
      i18n: {
        en: {
          title: 'Atlas IA',
          subtitle: 'Suporte 24/7',
          footer: '',
          getStarted: 'Nova Conversa',
          inputPlaceholder: 'Digite sua pergunta...',
          closeButtonTooltip: 'Fechar',
        },
      },
    });
  }, []);

  return (
    <>
      <style>{`
        #n8n-chat-bubble {
          --chat--color--primary: #01FC8D;
          --chat--color--primary-shade-50: #00d977;
          --chat--color--primary--shade-100: #00bc66;
          --chat--color--secondary: #01FC8D;
          --chat--color-secondary-shade-50: #00d977;
          --chat--color-light: #111827;
          --chat--color-light-shade-50: #1a2535;
          --chat--color-light-shade-100: #1e2d40;
          --chat--color-medium: #2d3a4f;
          --chat--color-dark: #e5e7eb;
          --chat--color-disabled: #374151;
          --chat--color-typing: #9ca3af;

          --chat--body--background: #080e1c;
          --chat--header--background: #060b17;
          --chat--header--color: #ffffff;
          --chat--header--border-bottom: 1px solid rgba(1, 252, 141, 0.15);

          --chat--message--bot--background: #0f1a2e;
          --chat--message--bot--color: #e5e7eb;
          --chat--message--bot--border: 1px solid rgba(255,255,255,0.06);
          --chat--message--user--background: #01FC8D;
          --chat--message--user--color: #060b17;
          --chat--message--border-radius: 0.75rem;

          --chat--input--background: #0f1a2e;
          --chat--input--text-color: #e5e7eb;
          --chat--input--border: none;
          --chat--input--border-active: none;
          --chat--input--container--background: #060b17;
          --chat--input--container--border: 1px solid rgba(255,255,255,0.08);
          --chat--input--container--border-radius: 0.75rem;
          --chat--input--container--padding: 8px;

          --chat--input--send--button--background: transparent;
          --chat--input--send--button--color: #01FC8D;
          --chat--input--send--button--background-hover: rgba(1,252,141,0.1);
          --chat--input--send--button--color-hover: #01FC8D;

          --chat--footer--background: #060b17;
          --chat--footer--color: #4b5563;
          --chat--window--border: 1px solid rgba(255,255,255,0.08);

          --chat--toggle--background: #01FC8D;
          --chat--toggle--hover--background: #00d977;
          --chat--toggle--active--background: #00bc66;
          --chat--toggle--color: #060b17;

          --chat--button--background--primary: #01FC8D;
          --chat--button--color--primary: #060b17;
          --chat--button--background--primary--hover: #00d977;
          --chat--button--color--primary--hover: #060b17;
        }

        #n8n-chat-bubble .chat-input,
        #n8n-chat-bubble .chat-inputs,
        #n8n-chat-bubble [class*="chat-input"],
        #n8n-chat-bubble [class*="input-panel"],
        #n8n-chat-bubble > div > div:last-child {
          background-color: #060b17 !important;
        }

        #n8n-chat-bubble textarea,
        #n8n-chat-bubble input[type="text"],
        #n8n-chat-bubble input {
          background-color: #0f1a2e !important;
          color: #e5e7eb !important;
          border-color: rgba(255,255,255,0.08) !important;
        }

        #n8n-chat-bubble textarea::placeholder,
        #n8n-chat-bubble input::placeholder {
          color: #4b5563 !important;
        }
      `}</style>
      <div id="n8n-chat-bubble" />
    </>
  );
}
