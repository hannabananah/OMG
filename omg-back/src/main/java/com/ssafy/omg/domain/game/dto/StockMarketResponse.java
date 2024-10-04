package com.ssafy.omg.domain.game.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;

/**
 * 주식 거래소 정보
 */
@Getter
@Setter
@Builder
public class StockMarketResponse {
    private int[][] stockPriceChangeInfo;   // 주가 변동 그래프 정보
    private String[] playerNicknames;       // index별 player nickname 정보
    private int[][] playerStockShares;      // 플레이어 별 보유 주식 개수 (r: 주식 종류 , c: 플레이어 , value: 주식 개수)
    private int[] leftStocks;               // 주식 별 남은 주식 개수
    private int[] stockPrices;              // 주가
//    private int[] recentStockPriceChanges;  // 최근 거래 변동값

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        String info = "StockMarketResponse{" +
                "\n\t, playerNicknames=" + Arrays.toString(playerNicknames) +
                "\n\t, leftStocks=" + Arrays.toString(leftStocks) +
                "\n\t, stockPrices=" + Arrays.toString(stockPrices) +
//                "\n\t, recentStockPriceChanges=" + Arrays.toString(recentStockPriceChanges) +
                "\n\t, playerStockShares=";
        sb.append(info).append("\n");
        for (int i = 0; i < 6; i++) {
            sb.append("\t").append("\t").append("\t");
            for (int j = 0; j < 4; j ++) {
                sb.append(playerStockShares[i][j]).append(" | ");
            }
            sb.append("\n");
        }
        return sb.toString();
    }
}
