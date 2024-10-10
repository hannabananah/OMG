package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.player.dto.PlayerAnimation;

public record PlayerMoveRequest(
        double[] position,
        double[] direction,
        boolean actionToggle,
        boolean isTrading,
        boolean isCarrying,
        PlayerAnimation animation
) {
}
