"use client";

import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

const WEBHOOK_URL = "/api/chat";

export function N8nChatBubble() {
  useEffect(() => {
    createChat({
      i18n: {
        en: {
          closeButtonTooltip: "Fechar",
          footer: "",
          getStarted: "Nova Conversa",
          inputPlaceholder: "Digite sua pergunta...",
          subtitle: "Suporte 24/7",
          title: "Atlas IA",
        },
      },
      initialMessages: ["Olá! 👋", "Sou o Atlas, como posso te ajudar?"],
      mode: "window",
      target: "#n8n-chat-bubble",
      webhookUrl: WEBHOOK_URL,
    });
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "TEXTAREA" &&
        (target.closest("#n8n-chat-bubble") ||
          target.closest("#n8n-chat-embed")) &&
        e.key === "Enter" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        const sendButton = target
          .closest("form")
          ?.querySelector('button[class*="send"]') as HTMLButtonElement | null;
        if (sendButton && !sendButton.disabled) {
          sendButton.click();
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const bubble = document.getElementById("n8n-chat-bubble");
      if (!bubble) return;
      const chatWindow = bubble.querySelector(
        '[class*="n8n-chat-ui-window"]'
      ) as HTMLElement | null;
      if (!chatWindow) return;
      const isOpen =
        chatWindow.offsetParent !== null ||
        getComputedStyle(chatWindow).display !== "none";
      if (!isOpen) return;
      if (!bubble.contains(e.target as Node)) {
        const toggle = bubble.querySelector(
          '[class*="n8n-chat-ui-toggle"]'
        ) as HTMLButtonElement | null;
        toggle?.click();
      }
    };

    const repositionOnMobile = () => {
      const isMobile = window.innerWidth <= 1024;
      const elements = [
        document.getElementById("n8n-chat-bubble"),
        ...Array.from(
          document.querySelectorAll('[class*="n8n-chat-ui-toggle"]')
        ),
        ...Array.from(
          document.querySelectorAll('[class*="n8n-chat-ui-window"]')
        ),
        ...Array.from(document.querySelectorAll('div[class*="n8n-chat-ui"]')),
        ...Array.from(
          document.querySelectorAll('button[class*="n8n-chat-ui"]')
        ),
      ];

      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          if (isMobile) {
            el.style.setProperty("right", "20px", "important");
            el.style.setProperty("left", "auto", "important");
            el.style.setProperty("bottom", "110px", "important");
          } else {
            el.style.removeProperty("right");
            el.style.removeProperty("left");
            el.style.removeProperty("bottom");
          }
        }
      });
    };

    const observer = new MutationObserver(() => {
      repositionOnMobile();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", repositionOnMobile);

    // Initial call after a short delay to allow widget injection
    const timer = setTimeout(repositionOnMobile, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", repositionOnMobile);
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <style>{`
        #n8n-chat-bubble {
          --chat--color--primary: #008DE0;
          --chat--color--primary-shade-50: #007bc4;
          --chat--color--primary--shade-100: #006aa9;
          --chat--color--secondary: #008DE0;
          --chat--color-secondary-shade-50: #007bc4;
          --chat--color-light: #111827;
          --chat--color-light-shade-50: #1a2535;
          --chat--color-light-shade-100: #1e2d40;
          --chat--color-medium: #2d3a4f;
          --chat--color-dark: #e5e7eb;
          --chat--color-disabled: #374151;
          --chat--color-typing: #9ca3af;

          --chat--body--background: #060b17;
          --chat--header--background: #060b17;
          --chat--header--color: #ffffff;
          --chat--header--border-bottom: none;

          --chat--message--bot--background: rgba(26, 32, 44, 0.7);
          --chat--message--bot--color: #e2e8f0;
          --chat--message--bot--border: none;
          --chat--message--user--background: #008DE0;
          --chat--message--user--color: #ffffff;
          --chat--message--border-radius: 1.25rem;

          --chat--input--background: rgba(255, 255, 255, 0.1);
          --chat--input--text-color: #ffffff;
          --chat--input--border: none;
          --chat--input--border-active: none;
          --chat--input--container--background: transparent;
          --chat--input--container--border: none;
          --chat--input--container--border-radius: 9999px;
          --chat--input--container--padding: 0;

          --chat--footer--background: transparent;
          --chat--window--border-radius: 1.5rem;

          --chat--toggle--background: #ffffff;
          --chat--toggle--color: #008DE0;
          --chat--font-family: var(--font-roboto), sans-serif;
        }

        #n8n-chat-bubble *,
        #n8n-chat-bubble [class*="n8n-chat-ui"] {
          font-family: var(--font-roboto), sans-serif !important;
        }

        /* Forçando a cor do botão flutuante (Toggle) - Verde com Branco */
        [class*="n8n-chat-ui-toggle"],
        #n8n-chat-bubble [class*="n8n-chat-ui-toggle"],
        div[class*="toggle"],
        button[class*="toggle"],
        [class*="n8n-chat-ui-toggle"] > div {
          background-color: #008DE0 !important;
          background: #008DE0 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 15px rgba(0, 141, 224, 0.4) !important;
        }

        [class*="n8n-chat-ui-toggle"] svg,
        #n8n-chat-bubble [class*="n8n-chat-ui-toggle"] svg,
        button[class*="toggle"] svg {
          fill: #ffffff !important;
          color: #ffffff !important;
        }



        /* Reset total e definitivo para qualquer linha interna */
        #n8n-chat-bubble *,
        #n8n-chat-bubble [class*="n8n-chat-ui"] {
          border: none !important;
          border-top: none !important;
          box-shadow: none !important;
        }
        #n8n-chat-bubble [class*="n8n-chat-ui"]::before,
        #n8n-chat-bubble [class*="n8n-chat-ui"]::after {
          display: none !important;
        }

        #n8n-chat-bubble [class*="n8n-chat-ui-window"],
        #n8n-chat-bubble [class*="n8n-chat-ui-header"],
        #n8n-chat-bubble [class*="n8n-chat-ui-messages-list"],
        #n8n-chat-bubble [class*="n8n-chat-ui-footer"] {
          background-color: #060b17 !important;
          background: #060b17 !important;
        }

        /* Minimalist Header - More compact */
        #n8n-chat-bubble [class*="n8n-chat-ui-header"] {
          padding: 1.25rem 1.25rem 0.25rem 1.25rem !important;
          background: #060b17 !important;
        }

        #n8n-chat-bubble [class*="n8n-chat-ui-header-title"] {
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          font-size: 1.15rem !important;
          color: #ffffff !important;
        }

        #n8n-chat-bubble [class*="n8n-chat-ui-header-subtitle"] {
          color: #008DE0 !important;
          font-size: 0.75rem !important;
          opacity: 0.9;
          font-weight: 500 !important;
        }

        /* Glassmorphism Input Field - Formato de Pílula */
        div#n8n-chat-bubble [class*="footer"] form,
        div#n8n-chat-bubble [class*="footer"] > div {
          background: rgba(255, 255, 255, 0.15) !important;
          border-radius: 9999px !important;
          margin: 0 auto 1.5rem auto !important;
          padding: 2px 45px 0 1.25rem !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          transition: all 0.3s ease;
          min-height: 44px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
          width: 90% !important;
          box-sizing: border-box !important;
          position: relative !important;
          overflow: visible !important;
        }

        #n8n-chat-bubble footer,
        #n8n-chat-bubble [class*="footer"],
        #n8n-chat-bubble [class*="n8n-chat-ui-footer"] {
          padding: 1rem 1.25rem !important;
          background-color: #060b17 !important;
          background: #060b17 !important;
          border: none !important;
          box-shadow: none !important;
          display: flex !important;
          justify-content: center !important;
        }

        #n8n-chat-bubble [class*="n8n-chat-ui-input-container"]:focus-within {
          background-color: #1a202c !important;
          border-color: #008DE0 !important;
          box-shadow: 0 0 25px rgba(0, 141, 224, 0.2) !important;
        }

        #n8n-chat-bubble textarea {
          background-color: transparent !important;
          color: #ffffff !important;
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

        #n8n-chat-bubble textarea::placeholder {
          color: rgba(255, 255, 255, 0.3) !important;
          line-height: 20px !important;
        }

        /* Message Bubbles Refinement */
        #n8n-chat-bubble [class*="n8n-chat-ui-message"] {
          border-radius: 1.25rem !important;
          padding: 0.85rem 1.1rem !important;
          line-height: 1.5 !important;
          max-width: 85% !important;
          font-weight: 400 !important;
        }

        #n8n-chat-bubble [class*="n8n-chat-ui-message-bot"] {
          border-bottom-left-radius: 0.25rem !important;
          background: #1a202c !important;
          color: #e2e8f0 !important;
        }

        #n8n-chat-bubble [class*="n8n-chat-ui-message-user"] {
          border-bottom-right-radius: 0.25rem !important;
          background: #008DE0 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
        }

        /* Botão de Enviar na Pílula - Estados Dinâmicos */
        #n8n-chat-bubble [class*="footer"] button,
        #n8n-chat-bubble [class*="send"] {
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
        #n8n-chat-bubble [class*="send"]:disabled,
        #n8n-chat-bubble [class*="send"][disabled] {
          background: #ffffff !important;
          opacity: 0.4 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }

        /* Estado Ativo (Com texto) */
        #n8n-chat-bubble [class*="send"]:not(:disabled) {
          background: #008DE0 !important;
          opacity: 1 !important;
          cursor: pointer !important;
          box-shadow: 0 2px 8px rgba(0, 141, 224, 0.3) !important;
        }

        #n8n-chat-bubble [class*="send"] svg {
          width: 14px !important;
          height: 14px !important;
          color: #060b17 !important;
          transition: transform 0.2s ease !important;
        }

        #n8n-chat-bubble [class*="send"]:not(:disabled):hover {
          transform: translateY(-50%) scale(1.1) !important;
        }


        /* Custom Scrollbar */
        #n8n-chat-bubble [class*="n8n-chat-ui-messages-list"]::-webkit-scrollbar {
          width: 4px;
        }
        #n8n-chat-bubble [class*="n8n-chat-ui-messages-list"]::-webkit-scrollbar-track {
          background: transparent;
        }
        #n8n-chat-bubble [class*="n8n-chat-ui-messages-list"]::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        @media (max-width: 1024px) {
          #n8n-chat-bubble,
          [class*="n8n-chat-ui-toggle"],
          [class*="n8n-chat-ui-window"],
          div[class*="n8n-chat-ui"],
          button[class*="n8n-chat-ui"] {
            right: 20px !important;
            left: auto !important;
            bottom: 110px !important;
          }
        }

      `}</style>
      <div id="n8n-chat-bubble" />
    </>
  );
}
