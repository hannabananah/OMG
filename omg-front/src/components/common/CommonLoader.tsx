export default function CommonLoader() {
  return (
    <div
      className='flex flex-col items-center justify-center w-screen h-screen'
      style={{ backgroundImage: 'url("/assets/matrix2.gif")' }}
    >
      <img src='/assets/logo.png' alt='로고' className='w-44' />
      <span className='text-white font-omg-event-title text-omg-30b'>OMG</span>
      <span className='text-white font-omg-event-content text-omg-24'>
        Over the Money and Gold
      </span>
    </div>
  );
}
