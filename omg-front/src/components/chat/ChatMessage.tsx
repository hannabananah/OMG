import type { ChatMessage } from '@/types';

export default function ChatMessage({ sender, content }: ChatMessage) {
  return (
    <p className='mb-1 text-black font-omg-chat'>
      <strong>{sender}</strong>: {content}
    </p>
  );
}
