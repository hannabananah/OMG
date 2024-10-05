// import { goldPossessionInfo, players } from '@/assets/data/goldMarketData';
import { useGoldPossessionData } from '@/hooks/useGold';
import { useGoldStore } from '@/stores/useGoldStore';
import { ResponsiveBar } from '@nivo/bar';

export default function PossessionChart() {
  // 서버에서 플레이어 닉네임, 보유 금 수량 받아오기
  const { playerGoldCounts, playerNicknames } = useGoldStore();

  // 차트 데이터 생성
  const chartData = useGoldPossessionData(playerGoldCounts, playerNicknames);

  return (
    <ResponsiveBar
      data={chartData}
      keys={[...playerNicknames]} // 플레이어 이름
      indexBy='gold' // '금' 항목
      margin={{ top: 10, right: 30, bottom: 80, left: 80 }}
      padding={0.3}
      layout='horizontal' // 수평형 바 차트
      valueScale={{ type: 'linear' }}
      colors={{ scheme: 'nivo' }} // 색상 스키마
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: '플레이어 별 지분 (%)',
        legendPosition: 'middle',
        legendOffset: 48,
      }}
      label={d => `${Math.round(d.value)}%`} // 소수점 없이 지분 퍼센트 표시
      labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: 100,
          itemWidth: 110,
          itemHeight: 20,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 16,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
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
            fontSize: 12,
          },
        },
      }}
    />
  );
}
