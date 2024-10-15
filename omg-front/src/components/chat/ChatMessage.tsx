import type { ChatMessage } from '@/types';

export default function ChatMessage({ sender, content }: ChatMessage) {
  return (
    <p className='mb-1 text-black font-omg-chat'>
      <span className='font-bold text-omg-18'>{sender}</span>: {content}
    </p>
  );
}
