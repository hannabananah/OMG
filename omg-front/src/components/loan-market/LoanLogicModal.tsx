import { loanLimitLogic } from '@/assets/data/loanLimitLogic';

interface LoanLogicModalProps {
  isTooltipVisible: boolean;
}

export default function LoanLogicModal({
  isTooltipVisible,
}: LoanLogicModalProps) {
  return (
    <div>
      <div
        role='tooltip'
        aria-hidden={!isTooltipVisible}
        className={`absolute top-20 right-8 z-20 inline-block p-6 w-[440px] text-black transition-opacity duration-300 rounded-10 bg-white1 font-omg-body ${isTooltipVisible ? 'opacity-100' : 'invisible opacity-0'}`}
      >
        <h2 className='font-bold text-omg-18'>{loanLimitLogic.question}</h2>
        <p className='my-4 text-omg-14'>{loanLimitLogic.answer}</p>
        <p className='mb-6 text-omg-14'>
          아래의 단계를 통해 대출 한도를 계산합니다.
        </p>
        <ol className='pl-5 list-decimal'>
          {loanLimitLogic.steps.map((step, index) => (
            <li key={index} className='mt-4 text-omg-14'>
              {step.title}
              <div
                className='p-2 mt-2 font-mono text-omg-11 bg-lightgray rounded-10'
                aria-label={step.formula}
              >
                {step.formula}
              </div>
              {step.note && <div className='text-omg-11'>{step.note}</div>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
