package com.ssafy.omg.domain.game.entity;

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
    private String message;                        // 게임 통신 규약
    @JsonProperty("players")
    private List<Player> players;

    // 라운드 정보
    private int time;                            // 라운드 남은 시간
    private int round;                            // 현재 라운드
    private boolean[] isStockChanged;           // (길이 5 배열) 주가 변동 여부 -> 동시 거래 막기
    private boolean isGoldChanged;              // 금괴 가격 변동 여부 -> 동시 매입 막기

    // [게임] 정보
    private int interestRate;                    // 금리 -> 계산 시 /100으로 %계산 해줘야함
    private int[] economicEvent;                    // 경제 이벤트 카드 -> 금리 변동 (0: 초기값, 1~20:이벤트)
    private int stockPriceLevel;                // 현재 주가 수준

    // [게임] 게임판 트랙 정보 & 주머니
    private int[] pocket;                        // 주머니 길이 6 배열; 5가지 주식 및 검정 토큰
    private StockInfo[] market;                // 현재 주식 상황 (주식시장(종류별 개수), 주가)
    private int[] stockSell;                    // 매도 트랙
    private int[] stockBuy;                        // 매수 트랙
    private int[] goldBuy;                        // 금 매입 트랙

    // [게임] 금괴 정보
    private int goldPrice;                        // 금괴 가격
    private int goldCnt;                        // 금괴 매입 개수
}
