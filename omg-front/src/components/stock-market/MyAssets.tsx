export default function MyAssets() {
  const items = [
    {
      src: '/assets/socks-with-cane.png',
      alt: 'socks-with-cane',
      width: 24,
      height: 60,
      count: 1,
    },
    { src: '/assets/cane.png', alt: 'cane', width: 18, height: 36, count: 1 },
    { src: '/assets/socks.png', alt: 'socks', width: 20, height: 40, count: 1 },
    { src: '/assets/reels.png', alt: 'reels', width: 34, height: 34, count: 1 },
    { src: '/assets/candy.png', alt: 'candy', width: 24, height: 48, count: 1 },
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
