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
  return (
    <form onSubmit={handleSubmit} className='flex mt-2'>
      <input
        type='text'
        className='p-2 border rounded-l border-lime-500'
        onChange={handleInputChange}
        value={msg}
        placeholder='메시지를 입력하세요...'
      />
      <button type='submit' className='p-2 text-white rounded-r bg-lime-500'>
        전송
      </button>
    </form>
  );
}
