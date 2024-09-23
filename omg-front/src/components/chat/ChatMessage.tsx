interface ChatMessageProps {
  sender: string;
  content: string;
}

export default function ChatMessage({ sender, content }: ChatMessageProps) {
  return (
    <p className='text-lime-600'>
      <strong>{sender}</strong>: {content}
    </p>
  );
}
