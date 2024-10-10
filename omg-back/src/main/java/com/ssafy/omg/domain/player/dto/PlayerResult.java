package com.ssafy.omg.domain.player.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerResult {
    private String nickname;        // 플레이어 닉네임
    private int finalCash;          // 마지막 보유 현금
    private int finalGoldCnt;       // 마지막 보유 금 개수
    private int[] finalStockCnt;    // 마지막 보유 주식별 개수
    private int finalNetWorth;      // 마지막 순 자산 ( 부채 및 대출금 제외 )
    private int finalDebt;          // 마지막 총 부채 ( 대출금 및 이자 )
    private int finalTax;           // 마지막 세금
}