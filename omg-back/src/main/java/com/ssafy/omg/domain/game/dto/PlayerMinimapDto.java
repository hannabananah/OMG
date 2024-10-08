package com.ssafy.omg.domain.game.dto;

public record PlayerMinimapDto(
        String nickname,
        double[] position
) {
}
