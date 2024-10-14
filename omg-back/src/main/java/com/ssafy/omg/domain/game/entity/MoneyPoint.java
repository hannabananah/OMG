package com.ssafy.omg.domain.game.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class MoneyPoint {
    private String pointId;
    private double[] moneyCoordinates;  // 돈 좌표
    private int moneyStatus;         // 0: 먹음, 1: 안 먹은 돈(싼 거 1), 2: 안 먹은 돈(비싼 거 5)
}
