package com.ssafy.omg.domain.game.dto;

public record PlayerResponse(
        String nickname,
        double[] position,
        double[] direction
) {
}
