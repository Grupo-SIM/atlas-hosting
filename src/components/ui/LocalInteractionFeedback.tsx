"use client";

import { useEffect } from "react";

const FEEDBACK_DURATION_MS = 2_000;
const REQUEST_ASSOCIATION_WINDOW_MS = 2_000;
const INTERACTIVE_SELECTOR = 'button, a[href], [role="button"]';

/** Clears feedback early when an asynchronous local action has concluded. */
export function clearLocalInteractionFeedback(control: HTMLElement) {
  delete control.dataset.interactionFeedback;
}

/** Keeps acknowledgement visible after a touch without changing its action. */
export function LocalInteractionFeedback() {
  useEffect(() => {
    let lastInteraction:
      | { control: HTMLElement; id: number; expiresAt: number }
      | undefined;
    let nextInteractionId = 0;
    const activeInteractionIds = new WeakMap<HTMLElement, number>();
    const pendingRequestCounts = new Map<number, number>();

    const clearIfCurrent = (control: HTMLElement, id: number) => {
      if (activeInteractionIds.get(control) !== id) return;
      clearLocalInteractionFeedback(control);
    };

    const controlForRequest = () => {
      if (!lastInteraction || lastInteraction.expiresAt < Date.now()) {
        return undefined;
      }
      return lastInteraction;
    };

    const trackRequest = (
      interaction: NonNullable<typeof lastInteraction>,
      done: (callback: () => void) => void
    ) => {
      const { control, id } = interaction;
      pendingRequestCounts.set(id, (pendingRequestCounts.get(id) ?? 0) + 1);

      done(() => {
        const remaining = (pendingRequestCounts.get(id) ?? 1) - 1;
        if (remaining > 0) {
          pendingRequestCounts.set(id, remaining);
          return;
        }
        pendingRequestCounts.delete(id);
        clearIfCurrent(control, id);
      });
    };

    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      const interaction = controlForRequest();
      let request: Promise<Response>;

      try {
        request = originalFetch.call(window, ...args);
      } catch (error) {
        if (interaction) clearIfCurrent(interaction.control, interaction.id);
        throw error;
      }

      if (interaction) {
        trackRequest(interaction, done => {
          void request.then(done, done);
        });
      }

      return request;
    };

    const originalXhrSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function send(body) {
      const interaction = controlForRequest();
      if (interaction) {
        trackRequest(interaction, done => {
          this.addEventListener("loadend", done, { once: true });
        });
      }

      return originalXhrSend.call(this, body);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const control = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
      if (!control || control.matches(":disabled, [aria-disabled='true']")) {
        return;
      }

      const id = ++nextInteractionId;
      activeInteractionIds.set(control, id);
      control.dataset.interactionFeedback = "true";
      lastInteraction = {
        control,
        expiresAt: Date.now() + REQUEST_ASSOCIATION_WINDOW_MS,
        id,
      };
      window.setTimeout(() => {
        clearIfCurrent(control, id);
      }, FEEDBACK_DURATION_MS);
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
      passive: true,
    });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.fetch = originalFetch;
      XMLHttpRequest.prototype.send = originalXhrSend;
    };
  }, []);

  return null;
}
