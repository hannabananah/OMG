/**
 * 초를 mm:ss 형식으로 변환하는 함수
 * @param seconds 초 단위의 시간
 * @returns mm:ss 형식의 문자열
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
