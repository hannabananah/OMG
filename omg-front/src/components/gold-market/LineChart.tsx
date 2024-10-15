import { useContext } from 'react';

import { getMaxGoldPrice, goldChartData, goldDataUntilNow } from '@/hooks';
import { SocketContext } from '@/utils';
import { ResponsiveLine } from '@nivo/line';

interface LineChartProps {
  goldData: number[];
}

export default function LineChart({ goldData }: LineChartProps) {
  const { presentRound } = useContext(SocketContext);

  const goldChartDataProcessed = goldChartData(goldData);

  const filteredData = goldDataUntilNow(goldChartDataProcessed, presentRound);

  const maxPrice = getMaxGoldPrice(goldChartDataProcessed);

  return (
    <ResponsiveLine
      data={filteredData}
      margin={{ top: 20, right: 30, bottom: 70, left: 80 }}
      xScale={{ type: 'linear', min: 0, max: presentRound * 6 }}
      yScale={{ type: 'linear', min: 0, max: maxPrice }}
      colors={['#FEB833']}
      axisBottom={{
        tickValues: Array.from({ length: presentRound }, (_, i) => (i + 1) * 6),
        format: x => `${x / 6}라운드`,
        legend: '게임 Round',
        legendOffset: 50,
        legendPosition: 'middle',
      }}
      axisLeft={{
        legend: '금 시세',
        legendOffset: -50,
        legendPosition: 'middle',
      }}
      gridXValues={Array.from({ length: presentRound }, (_, i) => (i + 1) * 6)}
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
