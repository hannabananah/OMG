import {
  players,
  treeItemNameList,
  treeItemPossessionInfo,
} from '@/assets/data/stockPriceData';
import {
  getPossessionData,
  getTreeItemImagePath,
  shortenName,
} from '@/hooks/useStock';
import { StockItem } from '@/types';
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

export default function PossessionChart() {
  let data = getPossessionData(
    treeItemPossessionInfo,
    treeItemNameList,
    players,
  );

  // bar 차트 렌더링 순서 위해 뒤집기
  data = data.sort(
    (a, b) =>
      treeItemNameList.indexOf(b.treeItemName) -
      treeItemNameList.indexOf(a.treeItemName),
  );

  // 플레이어 이름 목록
  const nickNameList = [...players].map(shortenName);

  return (
    <ResponsiveBar
      data={data}
      keys={nickNameList}
      indexBy='treeItemName'
      margin={{ top: 0, right: 10, bottom: 130, left: 120 }}
      padding={0.3}
      layout='horizontal'
      valueScale={{ type: 'linear' }}
      colors={{ scheme: 'nivo' }}
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
      label={d => `${Math.round(d.value)}%`} // 소수점 없이 값 렌더링
      // labelSkipWidth={12}
      // labelSkipHeight={12}
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
