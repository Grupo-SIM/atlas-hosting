'use client';
import dynamic from 'next/dynamic';

const N8nChatBubble = dynamic(
  () => import('./N8nChatBubble').then((m) => m.N8nChatBubble),
  { ssr: false }
);

export function N8nChatWrapper() {
  return <N8nChatBubble />;
}
