type ButtonStyleType = 'mainmap' | 'trade' | 'count'; // 추후 필요한 애들 추가 할 것

interface ButtonProps {
  text: string;
  type: ButtonStyleType;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export default function Button({ text, type, onClick, disabled }: ButtonProps) {
  const buttonStyles = {
    mainmap: `text-omg-24b bg-white rounded-10 drop-shadow-xl px-8 py-2`,
    trade: `text-omg-24 bg-center pb-2 transition-transform duration-200 ease-in-out hover:scale-105`,
    count: 'text-omg-14 px-3 py-1 bg-white rounded-10 drop-shadow-xl',
  };

  return (
    <button
      className={`${buttonStyles[type]} ${disabled ? 'text-gray-500 opacity-50 cursor-not-allowed' : 'opacity-100'}`}
      onClick={onClick}
      disabled={disabled}
      style={
        type === 'trade'
          ? {
              backgroundImage: `url('/assets/trade-button.png')`,
              backgroundSize: 'cover',
              width: '180px',
              height: '70px',
            }
          : {}
      }
    >
      {text}
    </button>
  );
}
