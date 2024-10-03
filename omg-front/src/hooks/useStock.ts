import {
  PossessionDataInfo,
  StockDataItem,
  StockDataItemInKorean,
  StockItem,
  StockItemInKorean,
  StockPriceDataInfo,
} from '@/types';

// 1. 주식 차트 (Graph)

// 1) 현재까지의 데이터만 필터링 (가격 0인 지점 이후는 무시)
export const stockDataUntilNow = (
  data: StockDataItem[] | StockDataItemInKorean[],
  currentRound: number,
): (StockDataItem | StockDataItemInKorean)[] => {
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

// 2) 가장 높은 주가 뽑아내기 (최초 시점에서 최고 가: 8)
export const getMaxPrice = (
  data: StockDataItem[] | StockDataItemInKorean[],
): number => {
  // return Math.max(...data.flatMap(i => i.data.map(point => point.y)));
  return data.reduce((maxPrice, item) => {
    const itemMaxPrice = Math.max(...item.data.map(point => point.y));
    return Math.max(maxPrice, itemMaxPrice);
  }, 8);
};

// 3) 마지막 시점 주가 & 가격 등락 폭 계산 함수
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

// 4) 차트 범례를 한글로 표시해주기 위한 mapping 함수
export const treeItemNameInKorean = (id: StockItem): StockItemInKorean => {
  const translations: Record<StockItem, StockItemInKorean> = {
    candy: '사탕',
    cupcake: '컵케이크',
    gift: '선물',
    hat: '모자',
    socks: '양말',
  };
  return translations[id];
};

// 2. 주식 별 플레이어들의 지분 비율 (Bar 차트)

// 1) 각 트리 장식 별 지분 계산 함수
export const getPossessionData = (
  treeItemPossessionInfo: number[][],
  treeItemNameList: StockItem[],
  players: string[],
): PossessionDataInfo[] => {
  return treeItemPossessionInfo.map((item, index): PossessionDataInfo => {
    // 총 보유 수량 계산
    const total = item.reduce((acc, value) => acc + value, 0);

    // 각 플레이어 비율 계산
    const possessionData: PossessionDataInfo = {
      treeItemName: treeItemNameList[index],
    };

    // 아무도 해당 주식 갖고 있지 않으면, 회색 영역으로 표시
    if (total === 0) {
      return {
        treeItemName: treeItemNameList[index], // 트리 장식 이름
        none: 0,
      };
    }

    players.forEach((player, idx) => {
      possessionData[player] = (item[idx] / total) * 100;
    });

    return possessionData;
  });
};

// 2) 트리 장식(StockItem)에 따른 이미지 경로 동적 생성 함수
export const getTreeItemImagePath = (item: StockItem) => `/assets/${item}.png`;

// 3) 플레이어 닉네임이 긴 경우, 잘라서 보여주기 위한 커스텀 함수
export const shortenName = (name: string) => {
  return name.length > 10 ? `${name.slice(0, 10)}...` : name;
};
