import { useContext, useState } from 'react';

import ChatInputForm from '@/components/chat/ChatInputForm';
import ChatMessage from '@/components/chat/ChatMessage';
import { SocketContext } from '@/utils/SocketContext';

export default function Chatting() {
  const { sendMessage, chatMessages } = useContext(SocketContext);

  const [msg, setMsg] = useState<string>('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (msg.trim()) {
      sendMessage(msg);
      setMsg('');
    }
  };
  return (
    <div className='mt-4'>
      <h3 className='text-lime-700'>채팅:</h3>
      <div className='p-2 overflow-y-auto border max-h-40 border-lime-500'>
        {chatMessages.map((message, index) => (
          <ChatMessage
            key={index}
            sender={message.sender}
            content={message.content}
          />
        ))}
      </div>
      <ChatInputForm
        msg={msg}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
