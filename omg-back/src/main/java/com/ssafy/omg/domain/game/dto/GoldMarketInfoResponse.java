package com.ssafy.omg.domain.game.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GoldMarketInfoResponse {
    // 금 매입소용 차트 데이터
    private String[] playerNicknames = new String[4];
    private int[] playerGoldCounts = new int[4];

    // 금 상승 추이
    private int[] goldPriceChart = new int[61];

    // [게임] 금 정보
    private int goldPrice;                        // 금 가격
    private int goldPriceIncreaseCnt;             // 금 가격 상승 체크용 (금 추가 트랙)
}
