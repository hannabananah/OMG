package com.ssafy.omg.domain.game.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerRankingResponse {
    private String[] playerRanking;
}
