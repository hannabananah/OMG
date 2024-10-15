import { IoMdInformationCircleOutline } from 'react-icons/io';

import { ToastAlert } from '@/utils/ToastAlert';

export default function StockInfoButton() {
  const openStockInfo = () => {
    ToastAlert('주가 변동 관련 정보를 제공합니다.');
  };

  return (
    <button onClick={openStockInfo} aria-label='주식 정보 버튼'>
      <IoMdInformationCircleOutline />
    </button>
  );
}
