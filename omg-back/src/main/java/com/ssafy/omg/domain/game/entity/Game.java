package com.ssafy.omg.domain.game.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.ssafy.omg.domain.player.entity.Player;
import lombok.*;

import java.util.List;

/**
 * 게임 정보
 * - 금리, 경제카드, 주가수준, 금괴가격, 주머니, 금괴 매입개수별 추가,
 * - 주식 시장(종류별 개수, 주가), [매수트랙 매도트랙 금괴트랙], 라운드 수, 라운드 별 행위 순서,
 * - 한 라운드 시간, 주가 변동 여부 체크, 주가수준 계산(2차원배열?)
 */
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

    // [게임] 정보
    private int currentInterestRate;              // 금리 -> 계산 시 /100으로 %계산 해줘야함
    private int[] economicEvent;                  // 경제 이벤트 카드 -> 금리 변동 (0: 초기값, 1~20:이벤트)
    private GameEvent currentEvent;               // 이번 라운드에 발생한 경제 이벤트 뉴스 정보
    private int currentStockPriceLevel;           // 현재 주가 수준

    // [게임] 게임판 트랙 정보 & 주머니
    private int[] stockTokensPocket = new int[6]; // 주머니 길이 6 배열; 5가지 주식 및 검정 토큰
    private StockInfo[] marketStocks;             // 현재 주식 상황 (주식시장(종류별 개수), 주가)
    private int[] stockSellTrack;                 // 매도 트랙
    private int[] stockBuyTrack;                  // 매수 트랙
    private int[] goldBuyTrack;                   // 금 매입 트랙

    private List<MoneyPoint> moneyPoints;         // 돈 줍기 정보

    // [게임] 금괴 정보
    private int goldPrice;                        // 금괴 가격
    private int goldPriceIncreaseCnt;             // 금괴 가격 상승 체크용

    private int[][] stockPriceChangeInfo = new int[6][61];  // 주가 변동 그래프 정보
    private int[] goldPriceChart = new int[61];

    public void addGoldPrice(int amount) {  // amount는 올라야 할 칸 수
        for (int i = 0; i < amount; i++) {
            if (this.goldPrice >= 100) {
                break;
            }

            if (this.goldPrice < 30) {
                this.goldPrice += 1;
            } else {
                this.goldPrice += 5;
            }
        }
    }

    @JsonIgnore
    public void finishGame() {
        this.gameStatus = GameStatus.GAME_FINISHED;
    }

    @JsonIgnore
    public boolean isGameFinished() {
        return this.gameStatus == GameStatus.GAME_FINISHED;
    }

}
