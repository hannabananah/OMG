package com.ssafy.omg.domain.game.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameResultResponse {
    private String[] playerNicknameByRanking = new String[4];
    private int[] finalGoldCnt = new int[4];       // 마지막 보유 금 개수
    private int[] finalStockCnt = new int[4];      // 마지막 보유 주식별 개수
    private int[] finalNetWorth = new int[4];      // 마지막 순 자산 ( 부채 및 대출금 제외 )
    private int[] finalDebt = new int[4];          // 마지막 총 부채 ( 대출금 및 이자 )
}
