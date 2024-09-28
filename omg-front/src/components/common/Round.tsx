interface RoundProps {
  presentRound: number;
}

export default function Round({ presentRound }: RoundProps) {
  return (
    <p className='px-6 py-2 bg-white text-omg-24 rounded-10'>
      {presentRound}R / 10R
    </p>
  );
}
