import DefaultAlert from './DefaultAlert';
import LeftTimeAlert from './LeftTimeAlert';
import RoundEndAlert from './RoundEndAlert';
import StockChangeAlert from './StockChangeAlert';

export function getAlertComponent(message: string) {
  if (message.includes('주가')) {
    console.log('제발 주가 여기 렌더링 함수');
    return <StockChangeAlert message={message} />;
  } else if (message.includes('이자')) {
    return <RoundEndAlert message={message} />;
  } else if (message.includes('남았')) {
    return <LeftTimeAlert message={message} />;
  } else {
    return <DefaultAlert message={message} />;
  }
}
