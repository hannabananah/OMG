package com.ssafy.omg.domain.game.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockInfo {
    private int cnt;     // 주식 시장의 주식토큰 개수
    private int[] state; // 현재 주식의 가격을 stockStandard(주가 기준표) 2차원 배열의 위치값으로 표현
}
