import { useCharacter } from '@/hooks/useCharacter';
import useCountUp from '@/hooks/useCountUp';
import { useFloatingObject } from '@/hooks/useFloatingObject';
import {
  getMaxGoldPrice,
  goldChartData,
  goldDataUntilNow,
  useGoldPossessionData,
} from '@/hooks/useGold';
import { useGoldSwing } from '@/hooks/useGoldSwing';
import useSocket from '@/hooks/useSocket';
import {
  chartData,
  generateStockItemsDataWithUpdown,
  getCharacterImageByNickname,
  getMaxPrice,
  getPossessionData,
  getStockPriceData,
  getTreeItemImagePath,
  stockDataUntilNow,
  treeItemNameInKorean,
} from '@/hooks/useStock';
import {
  useCreateWaitingRoom,
  useEnterWaitingRoom,
  useHasWaitingRoom,
} from '@/hooks/useWaitingRoom';

export {
  useCreateWaitingRoom,
  useEnterWaitingRoom,
  useHasWaitingRoom,
  goldChartData,
  goldDataUntilNow,
  getMaxGoldPrice,
  useGoldPossessionData,
  useFloatingObject,
  useCharacter,
  useCountUp,
  chartData,
  stockDataUntilNow,
  getMaxPrice,
  getStockPriceData,
  treeItemNameInKorean,
  getPossessionData,
  getTreeItemImagePath,
  getCharacterImageByNickname,
  generateStockItemsDataWithUpdown,
  useSocket,
  useGoldSwing,
};
