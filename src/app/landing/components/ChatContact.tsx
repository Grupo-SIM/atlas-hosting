"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Roboto } from "next/font/google";
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const WEBHOOK_URL = 'https://bot.jbmidia.com/webhook/6229f9db-8b7f-40ad-8a71-503727e71c34/chat';

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
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

    return () => {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    };
  }, []);

  return (
    <>
      <style>{`
        #n8n-chat-embed {
          --chat--color--primary: #5865F2;
          --chat--color--primary-shade-50: #4752c4;
          --chat--color--primary--shade-100: #3c45a5;
          --chat--color--secondary: #5865F2;
          
          --chat--spacing: 1rem;
          --chat--border-radius: 2rem;
          --chat--font-family: var(--font-roboto), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

          --chat--body--background: #060b17;
          --chat--header--background: #060b17;
          --chat--header--color: #ffffff;
          --chat--header--border-bottom: none;

          --chat--message--font-size: 0.95rem;
          --chat--message--bot--background: #1f2937;
          --chat--message--bot--color: #f3f4f6;
          --chat--message--bot--border: none;
          --chat--message--user--background: #5865F2;
          --chat--message--user--color: #ffffff;
          --chat--message--border-radius: 1.5rem;
          
          --chat--messages-list--padding: 1.5rem;

          --chat--input--background: #111827;
          --chat--input--text-color: #ffffff;
          --chat--input--border: none;
          --chat--input--container--background: transparent;
          --chat--input--container--border: none;
          --chat--input--container--padding: 1rem;
          
          --chat--footer--background: #060b17;
          --chat--window--border-radius: 2rem;
        }

        /* Estilização do Campo de Input como Pilula/Cápsula */
        #n8n-chat-embed [class*="n8n-chat-ui-input-container"] {
          background-color: #111827 !important;
          border-radius: 3rem !important;
          margin: 1.25rem !important;
          padding: 0.25rem 1rem !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2) !important;
        }

        #n8n-chat-embed textarea {
          background-color: transparent !important;
          color: #ffffff !important;
          padding: 0.75rem 0 !important;
        }

        #n8n-chat-embed [class*="n8n-chat-ui-messages-list"] {
          background-color: #060b17 !important;
          overscroll-behavior: contain !important;
          overflow-y: auto !important;
        }

        #n8n-chat-embed {
          overscroll-behavior: contain;
        }

        /* Ajuste das Bolhas de Mensagem */
        [class*="n8n-chat-ui-message"] {
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 0.75rem !important;
        }

        /* Botão de Enviar */
        [class*="n8n-chat-ui-send-button"] {
          background: transparent !important;
          color: #5865F2 !important;
        }
        #n8n-chat-embed textarea::placeholder,
        #n8n-chat-embed input::placeholder {
          color: #4b5563 !important;
        }
      `}</style>

      <section className="">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#01FC8D]/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10 px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#01FC8D]/10 border border-[#01FC8D]/20 text-[#01FC8D] text-xs font-bold uppercase tracking-widest mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01FC8D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01FC8D]"></span>
                </span>
                Suporte Online agora
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`${roboto.className} text-4xl md:text-5xl font-bold text-white mb-6 leading-tight`}
              >
                Ficou com alguma dúvida? <br />
                <span className="text-[#01FC8D]">Converse com nossa IA.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-lg mb-8 max-w-lg"
              >
                Tire suas dúvidas sobre planos, domínios e cashback em tempo real com o assistente inteligente Atlas.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-3 text-sm text-gray-500"
              >
                {['Resposta em segundos', 'Disponível 24/7', 'Sem espera em filas'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#01FC8D]" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* n8n Chat Embed */}
            <div className="flex-1 w-full flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative w-full max-w-[480px]"
              >
                {/* Glow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[#01FC8D]/20 via-transparent to-[#01FC8D]/5 rounded-[1.5rem] blur-md" />

                {/* Card */}
                <div className="relative rounded-[1.25rem] overflow-hidden border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] bg-[#060b17]">
                  {/* Header decorative bar */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#01FC8D]/60 to-transparent" />

                  <div id="n8n-chat-embed" style={{ width: '100%', height: '560px' }} />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
