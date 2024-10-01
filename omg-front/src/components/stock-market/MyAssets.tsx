export default function MyAssets() {
  const items = [
    {
      src: '/assets/candy.png',
      alt: 'candy',
      width: 24,
      height: 48,
      count: 1,
    },
    {
      src: '/assets/cupcake.png',
      alt: 'cupcake',
      width: 32,
      height: 48,
      count: 1,
    },
    { src: '/assets/gift.png', alt: 'gift', width: 36, height: 48, count: 1 },
    { src: '/assets/hat.png', alt: 'hat', width: 32, height: 36, count: 1 },
    { src: '/assets/socks.png', alt: 'socks', width: 24, height: 40, count: 1 },
  ];

  return (
    <div className='flex items-center gap-20 text-omg-24'>
      <div className='flex items-center gap-6'>
        <p>[보유 중인 트리 장식]</p>
        <ul className='flex items-center gap-4 text-omg-18'>
          {items.map((item, index) => (
            <li key={index} className='flex items-center gap-2'>
              <img
                src={item.src}
                alt={item.alt}
                style={{ width: `${item.width}px`, height: `${item.height}px` }}
              />
              <p>{item.count}개</p>
            </li>
          ))}
        </ul>
      </div>
      <div className='flex items-center gap-6'>
        <p>[현금]</p>
        <p>$100</p>
      </div>
    </div>
  );
}
