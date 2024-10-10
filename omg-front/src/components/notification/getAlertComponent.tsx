import DefaultAlert from './DefaultAlert';
import LeftTimeAlert from './LeftTimeAlert';
import RoundEndAlert from './RoundEndAlert';

export function getAlertComponent(message: string) {
  if (message.includes('주가')) {
    return;
  } else if (message.includes('이자')) {
    return <RoundEndAlert message={message} />;
  } else if (message.includes('남았')) {
    return <LeftTimeAlert message={message} />;
  } else {
    return <DefaultAlert message={message} />;
  }
}
