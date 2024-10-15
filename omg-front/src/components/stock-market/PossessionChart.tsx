import { itemNameList } from '@/assets/data/stockMarketData';
import {
  getCharacterImageByNickname,
  getPossessionData,
  getTreeItemImagePath,
} from '@/hooks/useStock';
import { useGameStore, useStockStore } from '@/stores';
import { Player, StockItem } from '@/types';
import { AxisTickProps } from '@nivo/axes';
import { ResponsiveBar } from '@nivo/bar';

// 세로 축 항목 커스텀: 트리 장식 이미지
const CustomTick = ({ x, y, value }: AxisTickProps<any>) => (
  <g transform={`translate(${x - 60},${y - 20})`}>
    <image
      href={getTreeItemImagePath(value as StockItem)}
      width='40'
      height='40'
    />
  </g>
);

// 차트 범례 커스텀: 각 유저의 이미지
const CustomLegendSymbol = ({
  id,
  players,
}: {
  id: string | number;
  players: Player[];
}) => {
  const imageSrc = getCharacterImageByNickname(String(id), players); // 닉네임에 맞는 이미지 가져오기
  return <image href={imageSrc} width={30} height={30} x={-16} y={-5} />;
};

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

        // 닉네임에 맞는 이미지 가져오기
        const imageSrc = getCharacterImageByNickname(
          String(playerName),
          players,
        );

        return (
          <g
            key={bar.key}
            transform={`translate(${bar.x + bar.width / 2 - 10},${bar.y + 6})`}
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
  // 서버로 부터 데이터 받아오기
  const { playerNicknames, playerStockShares } = useStockStore();

  const { gameData } = useGameStore();
  const players = gameData?.players || [];

  let data = getPossessionData(
    playerStockShares.slice(1),
    itemNameList,
    playerNicknames,
  );

  // bar 차트 렌더링 순서 위해 뒤집기
  data = data.sort(
    (a, b) =>
      itemNameList.indexOf(b.treeItemName) -
      itemNameList.indexOf(a.treeItemName),
  );

  return (
    <ResponsiveBar
      data={data}
      keys={[...playerNicknames]}
      indexBy='treeItemName'
      margin={{ top: 0, right: 10, bottom: 130, left: 120 }}
      padding={0.3}
      layout='horizontal'
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
      axisLeft={{
        renderTick: CustomTick, // CustomTick(트리 장식 이미지) 사용한 렌더링
        legend: '트리 장식',
        legendPosition: 'middle',
        legendOffset: -90,
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
          // 범례에서 이미지와 색상 같이 표시
          symbolShape: ({ id }) => (
            <CustomLegendSymbol id={id} players={players} />
          ),

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
