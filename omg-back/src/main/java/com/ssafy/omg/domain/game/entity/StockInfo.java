package com.ssafy.omg.domain.game.entity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @NotNull
    @Size()
    private int[] state = new int[2]; // 현재 주식의 가격을 stockStandard(주가 기준표) 2차원 배열의 위치값으로 표현
//    private int recentTransaction; // 최근 주가 변동값

    public void addCnt(int amount) {
        this.cnt += amount;
    }

    public void decreaseState() {
        if (this.state[0] == 12 && this.state[1] == 0) {
            return;
        }

        if (this.state[1] == 0) {
            this.state[0]++;
        } else {
            this.state[1]--;
        }
    }

    public void increaseState() {
        if (this.state[0] == 0 && this.state[1] == 6) {
            return;
        }

        if (this.state[1] == 6) {
            this.state[0]--;
        } else {
            this.state[1]++;
        }
    }

    public void ascendAndDescendState(int dr) {
        if (dr < 0) {
            if (this.state[0] + dr < 0) {
                this.state[0] = 0;
            } else {
                this.state[0] += dr;
            }
        } else {
            if (this.state[0] + dr > 12) {
                this.state[0] = 12;
            } else {
                this.state[0] += dr;
            }
        }
    }

    public void setStockPriceInRange(int changeIdx) {
        int dr = StockState.stockDr[changeIdx];
        int dc = StockState.stockDc[changeIdx];

        if (this.state[1] == 6 && (1 <= changeIdx && changeIdx <= 6)) {
            dc = 1; // stockDc 1번 인덱스의 변동 값이 0이기 때문에
        } else if (this.state[1] == 0 && (changeIdx == 0 || 6 < changeIdx)) {
            dc = 1;
        }

        ascendAndDescendState(dr);
        this.state[1] += dc;
    }

}
