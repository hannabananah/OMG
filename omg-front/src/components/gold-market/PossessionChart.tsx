// import { goldPossessionInfo, players } from '@/assets/data/goldMarketData';
import { getCharacterImageByNickname, useGoldPossessionData } from '@/hooks';
import { useGameStore, useGoldStore } from '@/stores';
import { ResponsiveBar } from '@nivo/bar';

const CustomLabels = ({ bars, players }: any) => {
  return (
    <g>
      {bars.map((bar: any) => {
        const playerName = bar.data.id;
        const possessionRate = Math.round(bar.data.data[playerName]);

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
  const { playerGoldCounts, playerNicknames } = useGoldStore();

  const { gameData } = useGameStore();
  const players = gameData?.players || [];

  const chartData = useGoldPossessionData(playerGoldCounts, playerNicknames);

  return (
    <ResponsiveBar
      data={chartData}
      keys={[...playerNicknames]}
      indexBy='gold'
      margin={{ top: 10, right: 30, bottom: 80, left: 80 }}
      padding={0.3}
      layout='horizontal'
      valueScale={{ type: 'linear' }}
      colors={['#FE3439', '#22D007', '#FBCE04', '#547EFF', '#23A50F']}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: '플레이어 별 지분 (%)',
        legendPosition: 'middle',
        legendOffset: 48,
      }}
      label={() => ''}
      layers={[
        'grid',
        'axes',
        'bars',
        'markers',
        'legends',
        props => <CustomLabels {...props} players={players} />,
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
