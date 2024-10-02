import { StockDataItem, StockPriceDataInfo } from '@/types';

// 현재까지의 데이터만 필터링 (가격 0인 지점 이후는 무시)
export const stockDataUntilNow = (
  data: StockDataItem[],
  currentRound: number,
): StockDataItem[] => {
  // 첫 번째 아이템에서 가격(y)이 0이 아닌 가장 마지막 시간(x) 값 찾기
  const firstItem = data[0];
  const lastValidTime = firstItem.data.findIndex(point => point.y === 0);

  // lastValidTime이 -1이면 모든 데이터가 유효하다는 뜻
  const validEndTime = lastValidTime === -1 ? currentRound * 6 : lastValidTime;

  // 각 아이템에 대해 validEndTime까지의 데이터만 필터링
  return data.map(item => ({
    id: item.id,
    data: item.data.slice(0, validEndTime),
  }));
};

// 가장 높은 주가 뽑아내기 (최초 시점에서 최고 가: 8)
export const getMaxPrice = (data: StockDataItem[]): number => {
  // return Math.max(...data.flatMap(i => i.data.map(point => point.y)));
  return data.reduce((maxPrice, item) => {
    const itemMaxPrice = Math.max(...item.data.map(point => point.y));
    return Math.max(maxPrice, itemMaxPrice);
  }, 8);
};

// 마지막 시점 주가 & 가격 등락 폭 계산 함수
export const getStockPriceData = (
  stockChartData: StockDataItem[],
): StockPriceDataInfo[] => {
  // 첫 번째 아이템에서 가격(y)이 0이 아닌 가장 마지막 인덱스 찾기
  const firstItem = stockChartData[0];
  let lastValidIndex = 60;

  // 0이 아닌 가장 마지막 유효한 인덱스 찾고, 0 나오면 종료
  for (let i = 0; i <= 60; i++) {
    if (firstItem.data[i].y === 0) {
      break;
    }
    lastValidIndex = i;
  }

  const result = stockChartData.map(item => {
    const lastPrice = item.data[lastValidIndex].y; // 마지막 시점 주가
    const prevPrice =
      lastValidIndex > 0 ? item.data[lastValidIndex - 1].y : lastPrice; // 이전 시점 가격
    const updown = lastPrice - prevPrice; // 등락 계산

    return {
      itemName: item.id,
      price: lastPrice,
      updown,
    };
  });

  return result.reverse();
};
