interface MainAlertProps {
  text: string;
}

export default function MainAlert({ text }: MainAlertProps) {
  return (
    <div className='w-full p-4 text-center bg-white text-omg-24 rounded-20'>
      {text}
    </div>
  );
}
