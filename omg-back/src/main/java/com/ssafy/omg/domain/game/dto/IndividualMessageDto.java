package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.StockInfo;
import com.ssafy.omg.domain.player.entity.PlayerAction;
import com.ssafy.omg.domain.player.entity.PlayerStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class IndividualMessageDto {
    private int hasLoan;                    // 대출 유무
    private int loanPrincipal;              // 대출원금
    private int loanInterest;               // 이자
    private int totalDebt;                  // 갚아야 할 금액
    private int cash;                       // 현금
    private int[] stock = new int[6];       // 보유 주식 개수
    private int goldOwned;                  // 보유 금괴 개수

    private int[] carryingStocks;           // 플레이어별 집에 가지고 갈 주식
    private int carryingGolds;              // 플레이어별 집에 가지고 갈 금괴

    private PlayerAction action;            // 플레이어 행위 (주식 매수, 주식 매도, 금괴 매입, 대출, 상환)
    private PlayerStatus state;             // 플레이어 행위 상태 (시작전, 진행중, 완료)

    // 주식 거래소 정보
    private int[][] stockPriceChangeInfo;   // 주가 변동 그래프 정보
    private String[] playerNicknames;       // index별 player nickname 정보
    private int[][] playerStockShares;      // 플레이어 별 보유 주식 개수 (r: 주식 종류 , c: 플레이어 , value: 주식 개수)
    private StockInfo[] stockInfos;         // 주식 별 남은 주식 개수, 주가, 최근 거래 변동값
}