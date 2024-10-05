package com.ssafy.omg.domain.game.entity;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoanProduct implements Comparable<LoanProduct> {
    int interestRate;           // 이자율 (대출 당시 시장금리)
    int loanPrincipal;          // 대출 원금
    int loanInterest;           // 누적 이자
    int round;                  // 대출 당시의 라운드
    int loanTimestampInSeconds; // 대출 당시 라운드에서 진행된 시간(초)

    @Override
    public int compareTo(LoanProduct o) {
        // loanInterest 기준 내림차순
        int result = Integer.compare(o.loanInterest, this.loanInterest);
        if (result != 0) {
            return result;
        }

        // round 기준 오름차순
        result = Integer.compare(this.round, o.round);
        if (result != 0) {
            return result;
        }

        // loanTimestampInSeconds 기준 오름차순
        return Integer.compare(this.loanTimestampInSeconds, o.loanTimestampInSeconds);
    }
}
