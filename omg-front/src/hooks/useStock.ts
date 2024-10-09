import { characterTypeImages } from '@/assets/data/characterInfo';
import { itemNameList } from '@/assets/data/stockMarketData';
import {
  Player,
  PossessionDataInfo,
  StockDataItem,
  StockDataItemInKorean,
  StockItem,
  StockItemInKorean,
  StockPriceDataInfo,
} from '@/types';

// 1. 주식 차트 (Graph)

// 1) [변환] 백엔드 데이터 => 프론트 차트
export const chartData = (
  backendData: number[][],
  itemNameList: StockItem[],
): StockDataItem[] => {
  // 첫 번째 행(무의미한 데이터) 제외하고 1 ~ 5번째 사용
  return backendData
    .slice(1, 6)
    .reverse()
    .map((itemData, index) => {
      const data = itemData.map((price, time) => ({
        x: time,
        y: price,
      }));

      return {
        id: itemNameList[index],
        data,
      };
    });
};

// 2) 현재까지의 데이터만 필터링 (가격 0인 지점 이후는 무시)
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

// 3) 가장 높은 주가 뽑아내기 (최초 시점에서 최고 가: 8)
export const getMaxPrice = (
  data: StockDataItem[] | StockDataItemInKorean[],
): number => {
  // return Math.max(...data.flatMap(i => i.data.map(point => point.y)));
  return data.reduce((maxPrice, item) => {
    const itemMaxPrice = Math.max(...item.data.map(point => point.y));
    return Math.max(maxPrice, itemMaxPrice);
  }, 8);
};

// 4) 마지막 시점 주가 & 가격 등락 폭 계산 함수
export const getStockPriceData = (
  stockChartData: StockDataItem[],
): StockPriceDataInfo[] => {
  const result = stockChartData.map(item => {
    // 각 주식 아이템마다 마지막 유효 인덱스 찾기
    let lastValidIndex = item.data.length - 1;
    while (lastValidIndex >= 0 && item.data[lastValidIndex].y === 0) {
      lastValidIndex--;
    }

    // 마지막 시점 주가 및 이전 시점 주가 계산
    const lastPrice = lastValidIndex >= 0 ? item.data[lastValidIndex].y : 8; // 유효 값이 없으면 초기값 8
    const prevPrice = lastValidIndex > 0 ? item.data[lastValidIndex - 1].y : 8; // 이전 값도 없으면 초기값 8
    const updown = lastPrice - prevPrice;

    return {
      itemName: item.id,
      price: lastPrice,
      updown,
    };
  });

  return result.reverse(); // 결과를 reverse해서 반환
};

// 5) 차트 범례를 한글로 표시해주기 위한 mapping 함수
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
  itemNameList: StockItem[],
  players: string[],
): PossessionDataInfo[] => {
  return treeItemPossessionInfo.map((item, index): PossessionDataInfo => {
    // 총 보유 수량 계산
    const total = item.reduce((acc, value) => acc + value, 0);

    // 각 플레이어 비율 계산
    const possessionData: PossessionDataInfo = {
      treeItemName: itemNameList[index],
    };

    // 아무도 해당 주식 갖고 있지 않으면, 회색 영역으로 표시
    if (total === 0) {
      return {
        treeItemName: itemNameList[index], // 트리 장식 이름
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

// 4) 닉네임에 맞는 캐릭터 타입 이미지 가져오는 함수
export const getCharacterImageByNickname = (
  nickname: string,
  players: Player[],
): string => {
  const player = players.find(p => p.nickname === nickname);
  return player
    ? characterTypeImages[player.characterType]
    : '/assets/santa.png';
};

// 3. 메인 판

// 1) 주가 변동 (updown)을 포함한 주가 관련 데이터 생성 함수
export const generateStockItemsDataWithUpdown = (
  stockPriceChangeInfo: number[][],
) => {
  const itemNames = itemNameList; // 주식 이름 리스트

  // 1번째 행부터 주식별 가격 및 변동 계산
  return stockPriceChangeInfo.slice(1, 6).map((priceHistory, idx) => {
    // 0이 아닌 마지막 지점의 가격 찾기
    let lastPriceIdx = priceHistory.length - 1;
    while (lastPriceIdx >= 0 && priceHistory[lastPriceIdx] === 0) {
      lastPriceIdx--;
    }

    // 마지막 가격과 그 이전 가격을 이용해 주가 변동 계산
    const lastPrice = lastPriceIdx >= 0 ? priceHistory[lastPriceIdx] : 8;
    const previousPrice = lastPriceIdx > 0 ? priceHistory[lastPriceIdx - 1] : 8;
    const updown = lastPrice - previousPrice;

    return {
      name: itemNames[idx],
      src: `/assets/${itemNames[idx]}.png`,
      price: lastPrice, // 마지막 주가
      updown, // 주가 변동
      width: idx === 0 ? 16 : idx === 1 || idx === 4 ? 20 : 24, // 아이템별 이미지 크기
    };
  });
};
