package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.Game;

public record PlayerStateDto(
        String nickname,
        double[] position,
        double[] direction,
        boolean actionToggle,
        boolean isTrading,
        boolean isCarrying,
        String animation
) {
}
