interface SpeechBubbleProps {
  text: string;
}

export default function SpeechBubble({ text }: SpeechBubbleProps) {
  return (
    <>
      <div className='relative px-10 py-4 bg-white rounded-10 text-omg-20'>
        {text}
        <div className='absolute bottom-[-20px] left-1/2 -translate-x-1/2 border-t-[30px] border-t-white border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent'></div>
      </div>
    </>
  );
}
