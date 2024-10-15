package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.LoanProduct;
import com.ssafy.omg.domain.player.entity.PlayerAction;
import com.ssafy.omg.domain.player.entity.PlayerStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;
import java.util.TreeSet;

@Getter
@Setter
@Builder
public class IndividualMessageDto {
    private TreeSet<LoanProduct> loanProducts; // 대출 상품 기록
    private int totalDebt;                  // 총 부채
    private int loanLimit;                  // 대출 한도
    private int currentLoanPrincipal;       // 가장 최근 대출한 금액
    private int cash;                       // 현금
    private int[] stock;                    // 보유 주식 개수
    private int goldOwned;                  // 보유 금 개수

    private int[] carryingStocks;           // 플레이어별 집에 가지고 갈 주식
    private int carryingGolds;              // 플레이어별 집에 가지고 갈 금

    private PlayerAction action;            // 플레이어 행위 (주식 매수, 주식 매도, 금 매입, 대출, 상환)
    private PlayerStatus state;             // 플레이어 행위 상태 (시작전, 진행중, 완료)

    @Override
    public String toString() {
        return "IndividualMessageDto{" +
                "stock=" + Arrays.toString(stock) +
                '}';
    }
}