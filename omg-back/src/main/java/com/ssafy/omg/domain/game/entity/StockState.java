package com.ssafy.omg.domain.game.entity;

import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
@Getter
public class StockState {

    /**
     * 주가 기준표의 한 칸을 나타내는 클래스
     */
    @Getter
    public static class Stock {
        private int price;  // 해당 칸의 주가
        private int level;  // 해당 칸의 주가 수준

        public Stock(int price, int level) {
            this.price = price;
            this.level = level;
        }
    }

    /**
     * 주가 기준표
     * 2차원 배열로 구성되어 있으며, 각 칸은 주가와 주가 수준을 나타냄
     */
    private final Stock[][] stockStandard = {
            {new Stock(150, 8), new Stock(175, 8), new Stock(190, 8), new Stock(200, 9), new Stock(210, 9), new Stock(225, 9), new Stock(240, 9)},
            {new Stock(135, 7), new Stock(150, 7), new Stock(160, 8), new Stock(170, 8), new Stock(180, 8), new Stock(200, 8), new Stock(210, 9)},
            {new Stock(115, 6), new Stock(125, 7), new Stock(135, 7), new Stock(145, 7), new Stock(160, 7), new Stock(170, 8), new Stock(180, 8)},
            {new Stock(95, 6), new Stock(105, 6), new Stock(115, 6), new Stock(125, 6), new Stock(135, 7), new Stock(145, 7), new Stock(155, 7)},
            {new Stock(75, 5), new Stock(85, 5), new Stock(95, 5), new Stock(100, 6), new Stock(110, 6), new Stock(120, 6), new Stock(130, 6)},
            {new Stock(60, 4), new Stock(70, 4), new Stock(75, 5), new Stock(85, 5), new Stock(90, 5), new Stock(100, 5), new Stock(110, 6)},
            {new Stock(45, 3), new Stock(50, 4), new Stock(60, 4), new Stock(65, 4), new Stock(75, 4), new Stock(85, 5), new Stock(90, 5)},
            {new Stock(35, 3), new Stock(40, 3), new Stock(45, 3), new Stock(50, 3), new Stock(60, 4), new Stock(65, 4), new Stock(75, 4)},
            {new Stock(25, 2), new Stock(30, 2), new Stock(35, 2), new Stock(40, 3), new Stock(45, 3), new Stock(50, 3), new Stock(60, 3)},
            {new Stock(15, 1), new Stock(20, 1), new Stock(25, 2), new Stock(30, 2), new Stock(35, 2), new Stock(40, 2), new Stock(45, 3)},
            {new Stock(10, 0), new Stock(12, 1), new Stock(15, 1), new Stock(20, 1), new Stock(25, 1), new Stock(30, 2), new Stock(35, 2)},
            {new Stock(6, 0), new Stock(8, 0), new Stock(10, 0), new Stock(12, 0), new Stock(15, 1), new Stock(20, 1), new Stock(25, 1)},
            {new Stock(4, 0), new Stock(5, 0), new Stock(6, 0), new Stock(8, 0), new Stock(10, 0), new Stock(12, 0), new Stock(15, 0)}
    };

    /**
     * 주가 변동 참조표
     * dr: 주가 변동 시 행에 대한 변화량
     * dc: 주가 변동 시 열에 대한 변화량
     * 각 인덱스는 주가 변동 시, (0, 1, 2, 3, 4, 5, 6, -6, -5, -4, -3, -2, -1)에 해당
     */
    public static final int[] stockDr = {0, -1, -1, -2, -2, -3, -3, 3, 3, 2, 2, 1, 1};
    public static final int[] stockDc = {-1, 0, 1, 0, 1, 0, 1, 0, -1, 0, -1, 0, -1};

    /**
     * 주가 수준 카드
     * 각 배열은 주가 수준의 0~9를 나타냄
     */
    private final int[][] stockLevelCards = {
            {2, 5}, {3, 6}, {4, 6}, {5, 7}, {6, 7}, {7, 8}, {8, 9}, {9, 10}, {10, 11}, {11, 12}
    };

    public int getTradableCount(int currentStockPriceLevel) {
        int currentStockLevelCard[] = stockLevelCards[currentStockPriceLevel];
        return currentStockLevelCard[0];
    }
}
