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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex w-full text-omg-20'>
      <input
        type='text'
        className='w-full p-2 pl-4 mt-2 text-black rounded-b-10 border-t-1 border-lightgray caret-lightgray font-omg-chat'
        onChange={handleInputChange}
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
