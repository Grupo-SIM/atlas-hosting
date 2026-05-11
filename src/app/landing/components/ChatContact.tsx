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
          --chat--color--primary: #10b981;
          --chat--color--primary-shade-50: #059669;
          --chat--color--primary--shade-100: #047857;
          --chat--color--secondary: #10b981;
          
          --chat--spacing: 1rem;
          --chat--border-radius: 1.5rem;
          --chat--font-family: 'Roboto', var(--font-roboto), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

          --chat--body--background: transparent;
          --chat--header--background: transparent;
          --chat--header--color: #1e293b;
          --chat--header--border-bottom: none;

          --chat--message--font-size: 0.9rem;
          --chat--message--bot--background: #f1f5f9;
          --chat--message--bot--color: #334155;
          --chat--message--bot--border: none;
          --chat--message--user--background: #10b981;
          --chat--message--user--color: #ffffff;
          --chat--message--border-radius: 1.25rem;
          
          --chat--messages-list--padding: 1.25rem;

          --chat--input--background: #ffffff;
          --chat--input--text-color: #1e293b;
          --chat--input--border: none;
          --chat--input--container--background: transparent;
          --chat--input--container--border: none;
          --chat--input--container--padding: 0.75rem;
          
          --chat--footer--background: transparent;
          --chat--window--border-radius: 1.5rem;
        }

        /* Reset total e definitivo para qualquer linha interna */
        #n8n-chat-embed *,
        #n8n-chat-embed [class*="n8n-chat-ui"] {
          border: none !important;
          border-top: none !important;
          box-shadow: none !important;
          font-family: 'Roboto', var(--font-roboto), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }
        #n8n-chat-embed [class*="n8n-chat-ui"]::before,
        #n8n-chat-embed [class*="n8n-chat-ui"]::after {
          display: none !important;
        }

        /* Container adjustment for minimalist look */
        #n8n-chat-embed [class*="n8n-chat-ui-window"] {
          background-color: #ffffff !important;
          backdrop-filter: none;
        }

        /* Minimalist Header - More compact */
        #n8n-chat-embed [class*="n8n-chat-ui-header"] {
          padding: 1.25rem 1.25rem 0.25rem 1.25rem !important;
          background: transparent !important;
        }
        
        #n8n-chat-embed [class*="n8n-chat-ui-header-title"] {
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          font-size: 1.15rem !important;
          color: #0f172a !important;
        }

        #n8n-chat-embed [class*="n8n-chat-ui-header-subtitle"] {
          color: #10b981 !important;
          font-size: 0.75rem !important;
          opacity: 0.9;
          font-weight: 500 !important;
        }

        /* Glassmorphism Input Field - Formato de Pílula (Centralização Final) */
        div#n8n-chat-embed [class*="footer"] form,
        div#n8n-chat-embed [class*="footer"] > div {
          background: #f8fafc !important;
          border-radius: 9999px !important;
          margin: 0 auto 1.5rem auto !important;
          padding: 2px 45px 0 1.25rem !important;
          border: 1px solid #e2e8f0 !important;
          transition: all 0.3s ease;
          min-height: 44px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
          width: 90% !important;
          box-sizing: border-box !important;
          position: relative !important;
          overflow: visible !important;
        }

        /* Limpa bordas de qualquer div interno para evitar duplicidade */
        div#n8n-chat-embed [class*="footer"] form div,
        div#n8n-chat-embed [class*="footer"] > div div {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        #n8n-chat-embed [class*="n8n-chat-ui-footer"] {
          padding: 1rem 1.25rem 5rem 1.25rem !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          display: flex !important;
          justify-content: center !important;
        }

        #n8n-chat-embed [class*="n8n-chat-ui-messages-list"] {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }

        div#n8n-chat-embed [class*="n8n-chat-ui-input-container"]:focus-within {
          background-color: #ffffff !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.1) !important;
        }

        #n8n-chat-embed textarea {
          background-color: transparent !important;
          color: #1e293b !important;
          padding: 11px 0 0 0 !important;
          font-size: 0.85rem !important;
          height: 44px !important;
          line-height: 20px !important;
          text-align: left !important;
          resize: none !important;
          overflow-y: hidden !important;
          margin: 0 !important;
          flex: 1 !important;
          display: block !important;
          box-sizing: border-box !important;
        }

        #n8n-chat-embed textarea::placeholder {
          line-height: 20px !important;
          display: flex !important;
          align-items: center !important;
          color: #94a3b8 !important;
        }

        #n8n-chat-embed [class*="n8n-chat-ui-messages-list"] {
          background-color: transparent !important;
          overscroll-behavior: contain !important;
          border: none !important;
        }

        /* Message Bubbles Refinement */
        [class*="n8n-chat-ui-message"] {
          border-radius: 1.25rem !important;
          padding: 0.85rem 1.1rem !important;
          line-height: 1.5 !important;
          max-width: 85% !important;
          font-weight: 400 !important;
        }

        [class*="n8n-chat-ui-message-bot"] {
          border-bottom-left-radius: 0.25rem !important;
          background: #f1f5f9 !important;
          color: #334155 !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02) !important;
        }

        [class*="n8n-chat-ui-message-user"] {
          border-bottom-right-radius: 0.25rem !important;
          background: #10b981 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
        }

        /* Botão de Enviar na Pílula - Estados Dinâmicos */
        #n8n-chat-embed [class*="footer"] button,
        #n8n-chat-embed [class*="footer"] [class*="send"],
        #n8n-chat-embed [class*="send"] {
          position: absolute !important;
          right: 12px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          border-radius: 50% !important;
          width: 26px !important;
          height: 26px !important;
          min-width: 26px !important;
          min-height: 26px !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: none !important;
          z-index: 99 !important;
          transition: all 0.2s ease !important;
          margin: 0 !important;
        }

        /* Estado Desativado (Vazio) */
        #n8n-chat-embed [class*="send"]:disabled,
        #n8n-chat-embed [class*="send"][disabled] {
          background: #e2e8f0 !important;
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }

        /* Estado Ativo (Com texto) */
        #n8n-chat-embed [class*="send"]:not(:disabled) {
          background: #10b981 !important;
          opacity: 1 !important;
          cursor: pointer !important;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3) !important;
        }

        #n8n-chat-embed [class*="send"] svg {
          width: 14px !important;
          height: 14px !important;
          color: #ffffff !important;
        }

        /* Custom Scrollbar for minimalist look */
        [class*="n8n-chat-ui-messages-list"]::-webkit-scrollbar {
          width: 4px;
        }
        [class*="n8n-chat-ui-messages-list"]::-webkit-scrollbar-track {
          background: transparent;
        }
        [class*="n8n-chat-ui-messages-list"]::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>

      <section className={`${roboto.variable} py-20 lg:py-32 overflow-hidden relative`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10 px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Suporte Online agora
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`${roboto.className} text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight`}
              >
                Ficou com alguma dúvida? <br />
                <span className="text-emerald-500">Converse com nossa IA.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-slate-500 text-lg mb-8 max-w-lg"
              >
                Tire suas dúvidas sobre planos, domínios e cashback em tempo real com o assistente inteligente Atlas.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-3 text-sm text-slate-400"
              >
                {['Resposta em segundos', 'Disponível 24/7', 'Sem espera em filas'].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
                {/* Subtle Glow */}
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent rounded-[1.5rem] blur-xl opacity-30" />

                {/* Card */}
                <div className="relative rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white">
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
