package com.ssafy.omg.domain.game.dto;

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
public class MainMessageDto {
    private int stockPrices[];              // 주식 가격
    private int goldPrice;                  // 금 가격
    private int currentInterestRate;        // 금리
    private int currentStockPriceLevel;     // 주가 수준
    private int tradableStockCnt;           // 주가 수준에 의한 거래 가능 개수
    private int remainingUntilChange;       // 매도트랙으로 인한 주가변동까지 남은 비율 : 프론트에선 x 20 해줘야함
}
