"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Roboto } from "next/font/google";
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const WEBHOOK_URL = 'https://bot.jbmidia.com/webhook/6229f9db-8b7f-40ad-8a71-503727e71c34/chat';

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export function ChatContact() {
  useEffect(() => {
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (this: Element, options?: boolean | ScrollIntoViewOptions) {
      const chatEmbed = document.getElementById('n8n-chat-embed');
      if (chatEmbed && chatEmbed.contains(this)) {
        const messagesList = chatEmbed.querySelector('[class*="messages"]') as HTMLElement | null;
        if (messagesList) {
          messagesList.scrollTop = messagesList.scrollHeight;
          return;
        }
      }
      originalScrollIntoView.call(this, options);
    };

    createChat({
      webhookUrl: WEBHOOK_URL,
      mode: 'fullscreen',
      target: '#n8n-chat-embed',
      showWelcomeScreen: false,
      initialMessages: [
        'Olá! 👋',
        'Sou o Atlas, como posso te ajudar?',
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

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Verifica se o evento veio de um textarea dentro do nosso chat
      if (target.tagName === 'TEXTAREA' &&
        (target.closest('#n8n-chat-embed') || target.closest('#n8n-chat-bubble')) &&
        e.key === 'Enter' && !e.shiftKey) {

        e.preventDefault();
        const sendButton = target.closest('form')?.querySelector('button[class*="send"]') as HTMLButtonElement | null;
        if (sendButton && !sendButton.disabled) {
          sendButton.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      Element.prototype.scrollIntoView = originalScrollIntoView;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <style>{`
        #n8n-chat-embed {
          --chat--color--primary: #00A3FF;
          --chat--color--primary-shade-50: #0091E6;
          --chat--color--primary--shade-100: #007FC9;
          --chat--color--secondary: #00A3FF;
          
          --chat--spacing: 1rem;
          --chat--border-radius: 1.5rem;
          --chat--font-family: 'Roboto', var(--font-roboto), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

          --chat--body--background: #ffffff;
          --chat--header--background: #ffffff;
          --chat--header--color: #0f172a;
          --chat--header--border-bottom: 1px solid #f1f5f9;

          --chat--message--font-size: 1rem;
          --chat--message--bot--background: #f1f5f9;
          --chat--message--bot--color: #0f172a;
          --chat--message--bot--border: none;
          --chat--message--user--background: #00A3FF;
          --chat--message--user--color: #ffffff;
          --chat--message--border-radius: 1.25rem;
          
          --chat--messages-list--padding: 1.25rem;

          --chat--input--background: #f8fafc;
          --chat--input--text-color: #0f172a;
          --chat--input--border: 1px solid #e2e8f0;
          --chat--input--container--background: #ffffff;
          --chat--input--container--border: none;
          --chat--input--container--padding: 1rem;
          
          --chat--footer--background: #ffffff;
          --chat--window--border-radius: 1.5rem;
        }

        #n8n-chat-embed [class*="n8n-chat-ui-window"] {
          background-color: #ffffff !important;
        }

        #n8n-chat-embed [class*="n8n-chat-ui-header-title"] {
          color: #0f172a !important;
          font-weight: 700 !important;
        }

        #n8n-chat-embed [class*="n8n-chat-ui-header-subtitle"] {
          color: #00A3FF !important;
        }

        /* Pill-style Input Field - Modern & Integrated */
        div#n8n-chat-embed [class*="footer"] form {
          background: #f8fafc !important;
          border-radius: 9999px !important;
          margin: 0 1.25rem 1.5rem 1.25rem !important;
          padding: 0 8px 0 1.5rem !important;
          border: 1px solid #e2e8f0 !important;
          display: flex !important;
          align-items: center !important;
          position: relative !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) !important;
          min-height: 48px !important;
        }

        #n8n-chat-embed textarea {
          background: transparent !important;
          border: none !important;
          color: #0f172a !important;
          padding: 0 !important;
          font-size: 1rem !important;
          height: 24px !important;
          line-height: 24px !important;
          resize: none !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          margin: 0 !important;
        }

        #n8n-chat-embed textarea::placeholder {
          line-height: 24px !important;
          display: flex !important;
          align-items: center !important;
        }

        #n8n-chat-embed [class*="send"] {
          position: relative !important;
          top: -8px !important;
          background: #00A3FF !important;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          cursor: pointer !important;
          transition: none !important;
          margin-left: 10px !important;
          flex-shrink: 0 !important;
        }

        #n8n-chat-embed [class*="send"]:disabled,
        #n8n-chat-embed [class*="send"][disabled] {
          background: #e2e8f0 !important;
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }

        #n8n-chat-embed [class*="send"] svg {
          width: 16px !important;
          height: 16px !important;
          color: #ffffff !important;
        }
      `}</style>

      <section className={`${roboto.variable} py-20 lg:py-32 overflow-hidden relative bg-transparent`}>
        <div className="container mx-auto max-w-7xl relative z-10 px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-1.5 text-[14px] font-bold uppercase tracking-[0.12em] text-sky-400 mb-8"
              >
                ● SUPORTE ONLINE AGORA
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`${roboto.className} text-[2.5rem] md:text-[3.5rem] font-black text-white mb-6 leading-[1.1] tracking-tight`}
              >
                Ficou com alguma dúvida?<br />
                <span className="text-[#00A3FF]">Converse com nossa IA.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white text-xl mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                Tire suas dúvidas sobre planos, domínios e cashback em tempo real com o assistente inteligente Atlas.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center lg:items-start gap-4 text-base font-bold text-white uppercase tracking-wide"
              >
                {['Resposta em segundos', 'Disponível 24/7', 'Sem espera em filas'].map((item) => (
                  <span key={item} className="flex items-center gap-3 w-fit">
                    <span className="w-2 h-2 rounded-full bg-[#00A3FF]" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* n8n Chat Embed */}
            <div className="flex-1 w-full flex justify-center lg:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative w-full max-w-[480px]"
              >
                {/* Chat Widget Container - White Background as requested */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-white">
                  <div id="n8n-chat-embed" style={{ width: '100%', height: '620px' }} />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
