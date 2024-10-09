import { useContext } from 'react';

import {
  getMaxGoldPrice,
  goldChartData,
  goldDataUntilNow,
} from '@/hooks/useGold';
import { SocketContext } from '@/utils/SocketContext';
// 새로운 훅 import
import { ResponsiveLine } from '@nivo/line';

interface LineChartProps {
  goldData: number[]; // 백엔드에서 받은 금 시세 데이터 (61 크기 배열)
}

export default function LineChart({ goldData }: LineChartProps) {
  const { presentRound } = useContext(SocketContext); // 현재 라운드 정보

  // 금 시세 데이터를 차트에 맞게 변환
  const goldChartDataProcessed = goldChartData(goldData);

  // 현재 라운드까지의 유효한 데이터 필터링
  const filteredData = goldDataUntilNow(goldChartDataProcessed, presentRound);

  // 최대 금 시세 값 계산
  const maxPrice = getMaxGoldPrice(goldChartDataProcessed);

  return (
    <ResponsiveLine
      data={filteredData}
      margin={{ top: 20, right: 30, bottom: 70, left: 80 }}
      xScale={{ type: 'linear', min: 0, max: presentRound * 6 }} // 각 라운드가 6개의 데이터로 나뉨
      yScale={{ type: 'linear', min: 0, max: maxPrice }} // 동적으로 최대 금 가격 조정
      colors={['#FEB833']}
      axisBottom={{
        tickValues: Array.from({ length: presentRound }, (_, i) => (i + 1) * 6), // 각 라운드 끝에만 틱 설정 (6, 12, 18, ...)
        format: x => `${x / 6}라운드`, // x축에 라운드 단위로 표시
        legend: '게임 Round',
        legendOffset: 50,
        legendPosition: 'middle',
      }}
      axisLeft={{
        legend: '금 시세',
        legendOffset: -50,
        legendPosition: 'middle',
      }}
      gridXValues={Array.from({ length: presentRound }, (_, i) => (i + 1) * 6)} // x축의 그리드 라인도 라운드 끝에만 표시
      enablePoints={true}
      pointSize={6}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      lineWidth={4} // 라인 두께
      theme={{
        grid: {
          line: {
            stroke: 'black',
          },
        },
        axis: {
          ticks: {
            text: {
              fontFamily: 'Katuri',
              fontSize: 14,
            },
          },
          legend: {
            text: {
              fontFamily: 'Katuri',
              fontSize: 14,
            },
          },
        },
        legends: {
          text: {
            fontFamily: 'Katuri',
            fontSize: 16,
          },
        },
      }}
    />
  );
}
