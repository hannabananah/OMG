type ButtonStyleType = 'mainmap'; // 추후 필요한 애들 추가 할 것

interface ButtonProps {
  text: string;
  type: ButtonStyleType;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({ text, type, onClick }: ButtonProps) {
  const buttonStyles = {
    mainmap: `text-omg-24b bg-white rounded-10 px-8 py-2`,
  };

  return (
    <button className={buttonStyles[type]} onClick={onClick}>
      {text}
    </button>
  );
}
