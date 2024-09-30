type ButtonStyleType = 'mainmap' | 'stock-trade'; // 추후 필요한 애들 추가 할 것

interface ButtonProps {
  text: string;
  type: ButtonStyleType;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export default function Button({ text, type, onClick, disabled }: ButtonProps) {
  const buttonStyles = {
    mainmap: `text-omg-24b bg-white rounded-10 px-8 py-2`,
    'stock-trade': `text-omg-28b text-white bg-green rounded-20 px-20 py-4`,
  };

  return (
    <button
      className={`${buttonStyles[type]} ${disabled ? 'opacity-70' : 'opacity-100'}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
