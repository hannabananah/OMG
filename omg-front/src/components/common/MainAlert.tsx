interface MainAlertProps {
  text: string;
}

export default function MainAlert({ text }: MainAlertProps) {
  return (
    <div className='w-[1024px] p-4 bg-white text-center text-omg-24 rounded-20'>
      {text}
    </div>
  );
}
