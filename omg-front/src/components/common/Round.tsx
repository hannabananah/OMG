export interface RoundProps {
  presentRound: number;
}

export default function Round({ presentRound }: RoundProps) {
  return (
    <p
      className={`px-6 drop-shadow-xl py-2 text-omg-24 bg-white fade-in ${presentRound === 10 && 'text-red'} rounded-10`}
    >
      {presentRound}R / 10R
    </p>
  );
}
