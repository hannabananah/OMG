import type { ChatMessage } from '@/types';

export default function ChatMessage({ sender, content }: ChatMessage) {
  return (
    <p className='text-lime-600'>
      <strong>{sender}</strong>: {content}
    </p>
  );
}
