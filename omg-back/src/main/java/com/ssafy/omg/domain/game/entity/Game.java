package com.ssafy.omg.domain.game.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ssafy.omg.domain.player.entity.Player;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Game {

    // 게임 정보
    private String gameId;                        // 게임 세션 아이디
    private GameStatus gameStatus;                // 현재 게임 진행 상태 (시작 전, 진행 중, 게임 종료)
    private String message;                       // 게임 통신 규약
    @JsonProperty("players")
    private List<Player> players;

    // 라운드 정보
    private int time;                             // 라운드 남은 시간
    private int round;                            // 현재 라운드
    private RoundStatus roundStatus;              // 현재 라운드 상태
    public boolean isPaused;                      // 라운드 정지 여부
    public int pauseTime;                         // 라운드 정지 시간
    private boolean[] isStockChanged;             // (길이 5 배열) 주가 변동 여부 -> 동시 거래 막기
    private boolean isGoldChanged;                // 금괴 가격 변동 여부 -> 동시 매입 막기

    // [게임] 정보
    private int interestRate;                     // 금리 -> 계산 시 /100으로 %계산 해줘야함
    private int[] economicEvent;                  // 경제 이벤트 카드 -> 금리 변동 (0: 초기값, 1~20:이벤트)
    private int stockPriceLevel;                  // 현재 주가 수준

    // [게임] 게임판 트랙 정보 & 주머니
    private int[] pocket;                         // 주머니 길이 6 배열; 5가지 주식 및 검정 토큰
    private StockInfo[] market;                   // 현재 주식 상황 (주식시장(종류별 개수), 주가)
    private int[] stockSell;                      // 매도 트랙
    private int[] stockBuy;                       // 매수 트랙
    private int[] goldBuy;                        // 금 매입 트랙

    // [게임] 금괴 정보
    private int goldPrice;                        // 금괴 가격
    private int goldCnt;                          // 금괴 매입 개수

    // [게임]

    // 5가지 주식
    @Getter
    @Setter
    @NoArgsConstructor
    public static class StockInfo {
        private int cnt;     // 주식 시장의 주식토큰 개수
        private int[] state; // 현재 주식의 가격을 stockStandard(주가 기준표) 2차원 배열의 위치값으로 표현

        public StockInfo(int cnt, int[] state) {
            this.cnt = cnt;
            this.state = state;
        }
    }

    // 주가 기준표
    private Stock[][] stockStandard = {
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

    // 주가 기준표의 한 칸
    @Getter
    @Setter
    class Stock {
        private int price;  // 해당 칸의 주가
        private int level;    // 해당 칸의 주가 수준

        public Stock(int price, int level) {
            this.price = price;
            this.level = level;
        }
    }

    /**
     * 주가 변동 참조표
     * <p>
     * - 만약 주가변동참조표에서 양수(3)의 위치로 이동해야 할 경우.
     * StockInfo stockA;
     * stockA.state[0] += dr[3]; stockA.state[1] += dc[3];
     * - 만약 주가변동참조표에서 음수(-2)의 위치로 이동해야 할 경우.
     * stockA.state[0] += dr[13-2]; stockA.state[1] += dc[13-2];
     * - 만약 주가변동참조표에서 0의 위치로 이동해야 할 경우.
     * stockA.state[0] += dr[0]; stockA.state[1] += dc[0];
     */
    private int[] stockDr = {0, -1, -1, 2, 2, 3, 3, -3, -3, -2, -2, -1, -1}; // 0, 1, 2, 3, 4, 5, 6, -6, -5, -4, -3, -2, -1
    private int[] stockDc = {-1, 0, 1, 0, 1, 0, 1, 0, -1, 0, -1, 0, -1}; // 0, 1, 2, 3, 4, 5, 6, -6, -5, -4, -3, -2, -1

}
