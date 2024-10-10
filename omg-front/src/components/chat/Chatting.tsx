import { useContext, useEffect, useRef, useState } from 'react';
import { TbFoldDown } from 'react-icons/tb';

import ChatInputForm from '@/components/chat/ChatInputForm';
import ChatMessage from '@/components/chat/ChatMessage';
import { SocketContext } from '@/utils/SocketContext';

interface ChattingProps {
  closeChattingModal: () => void;
}

export default function Chatting({ closeChattingModal }: ChattingProps) {
  const { sendMessage, chatMessages } = useContext(SocketContext);

  const [msg, setMsg] = useState<string>('');
  const chatRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (chatRef.current) {
      const newHeight = chatRef.current.scrollHeight;
      chatRef.current.scrollTop = newHeight;
    }
  }, [chatMessages]);

  return (
    <div className='absolute z-30 w-[300px] py-3 mb-6 bg-white bg-opacity-90 h-52 rounded-t-10 text-omg-14 font-omg-chat'>
      <button
        className='absolute p-2 -m-2 text-gray hover:text-black top-2 right-4'
        onClick={closeChattingModal}
      >
        <TbFoldDown size={24} />
      </button>

      <div
        ref={chatRef}
        className='justify-center h-full px-4 overflow-y-auto scrollbar-hidden'
      >
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
