package com.ssafy.omg.domain.game.dto;

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
}