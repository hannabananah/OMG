import { useMemo } from 'react';

import { GoldDataItem } from '@/types';

// 1. 금 시세 차트 (Graph)

// 1) [변환] 백엔드 데이터 => 프론트 차트 (금 시세 데이터를 차트 형식으로 변환)
export const goldChartData = (backendData: number[]): GoldDataItem[] => {
  return [
    {
      id: 'Gold',
      data: backendData.map((price, time) => ({
        x: time, // x축: 시간(20초 단위)
        y: price, // y축: 금 시세
      })),
    },
  ];
};

// 2) 현재까지의 데이터만 필터링 (가격 0인 지점 이후는 무시)
export const goldDataUntilNow = (
  data: GoldDataItem[],
  currentRound: number,
): GoldDataItem[] => {
  // 가격(y)이 0이 아닌 가장 마지막 시간(x) 값 찾기
  const lastValidTime = data[0].data.findIndex(point => point.y === 0);
  const validEndTime = lastValidTime === -1 ? currentRound * 6 : lastValidTime; // lastValidTime이 -1이면 모든 데이터가 유효하다는 뜻

  // 각 아이템에 대해 validEndTime까지의 데이터만 필터링
  return data.map(item => ({
    id: item.id,
    data: item.data.slice(0, validEndTime),
  }));
};

// 3) 가장 높은 금 가격 뽑아내기 (최초 시점에서 최고 가: 20)
export const getMaxGoldPrice = (data: GoldDataItem[]): number => {
  const maxPrice = data.reduce((currentMaxPrice, item) => {
    const itemMaxPrice = Math.max(...item.data.map(point => point.y));
    return Math.max(currentMaxPrice, itemMaxPrice);
  }, 20); // 초기 금 시세 20

  // 5의 배수로 올림 처리
  return Math.ceil(maxPrice / 5) * 5;
};

// 2. 금 보유 비율 (Bar 차트)

// 1) 금 보유 비율 데이터 생성
export const useGoldPossessionData = (
  goldPossessionInfo: number[],
  players: string[],
) => {
  // 분모: 전체 금 보유 총 개수
  const totalGold = useMemo(() => {
    return goldPossessionInfo.reduce((sum, amount) => sum + amount, 0);
  }, [goldPossessionInfo]);

  // 데이터 생성
  const data = useMemo(() => {
    return [
      {
        gold: '금',
        ...players.reduce<Record<string, number>>((acc, player, idx) => {
          acc[player] =
            totalGold > 0 ? (goldPossessionInfo[idx] / totalGold) * 100 : 0;
          return acc;
        }, {}),
      },
    ];
  }, [players, goldPossessionInfo, totalGold]);

  return data;
};
