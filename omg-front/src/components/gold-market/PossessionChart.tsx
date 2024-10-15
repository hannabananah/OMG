// import { goldPossessionInfo, players } from '@/assets/data/goldMarketData';
import { useGoldPossessionData } from '@/hooks/useGold';
import { getCharacterImageByNickname } from '@/hooks/useStock';
import { useGameStore, useGoldStore } from '@/stores';
import { ResponsiveBar } from '@nivo/bar';

// 커스텀 레이블 추가: 주식별 퍼센트 옆에 캐릭터 이미지 추가
const CustomLabels = ({ bars, players }: any) => {
  return (
    <g>
      {bars.map((bar: any) => {
        const playerName = bar.data.id;
        const possessionRate = Math.round(bar.data.data[playerName]);

        // 지분 없으면 이미지 렌더링하지 않음
        if (!possessionRate) {
          return null;
        }

        const imageSrc = getCharacterImageByNickname(
          String(playerName),
          players,
        );

        return (
          <g
            key={bar.key}
            transform={`translate(${bar.x + bar.width / 2 - 20},${bar.y + 6})`}
          >
            <image href={imageSrc} width='30' height='30' />
            <text
              x={18}
              y={44}
              textAnchor='middle'
              style={{
                fill: '#000',
                fontWeight: 'bold',
                fontSize: 12,
              }}
            >
              {possessionRate}%
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default function PossessionChart() {
  // 서버에서 플레이어 닉네임, 보유 금 수량 받아오기
  const { playerGoldCounts, playerNicknames } = useGoldStore();

  const { gameData } = useGameStore();
  const players = gameData?.players || [];

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
      colors={['#FE3439', '#22D007', '#FBCE04', '#547EFF', '#23A50F']} // 플레이어 별로 각기 다른 색상 지정
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: '플레이어 별 지분 (%)',
        legendPosition: 'middle',
        legendOffset: 48,
      }}
      label={() => ''} // 기존 텍스트 라벨 숨기기
      layers={[
        'grid',
        'axes',
        'bars',
        'markers',
        'legends',
        props => <CustomLabels {...props} players={players} />, // 커스텀 레이블 추가
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
      }}
    />
  );
}
