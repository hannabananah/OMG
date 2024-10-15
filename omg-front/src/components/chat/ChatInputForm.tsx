import { useSoundStore } from '@/stores/useSoundStore';
import useUser from '@/stores/useUser';

interface ChatInputFormProps {
  msg: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function ChatInputForm({
  msg,
  handleInputChange,
  handleSubmit,
}: ChatInputFormProps) {
  const { nickname } = useUser();
  const { playTypingSound } = useSoundStore();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    if (nickname) {
      playTypingSound();
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex w-full text-omg-20'>
      <input
        type='text'
        className='w-full p-2 pl-4 mt-2 text-black rounded-b-10 border-t-1 border-lightgray caret-lightgray font-omg-chat'
        onChange={handleChange}
        value={msg}
        placeholder='메시지를 입력하세요...'
        onKeyDown={handleKeyDown}
      />
      <button type='submit' className='hidden'>
        전송
      </button>
    </form>
  );
}
