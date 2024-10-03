package com.ssafy.omg.domain.game.entity;

import com.ssafy.omg.config.baseresponse.BaseException;
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

    public void decreaseState() throws BaseException {
        if (this.state[0] == 12 && this.state[1] == 0) {
//            throw new BaseException(INVALID_STOCK_STATE);
            return;
        } else {
            if (this.state[1] == 0) {
                this.state[0] += 1;
            } else {
                this.state[1] -= 1;
            }
        }
    }

    public void increaseState() throws BaseException {
        if (this.state[0] == 0 && this.state[1] == 6) {
//            throw new BaseException(INVALID_STOCK_STATE);
            return;
        } else {
            if (this.state[1] == 6) {
                this.state[0] -= 1;
            } else {
                this.state[1] += 1;
            }
        }
    }
}
