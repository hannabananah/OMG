package com.ssafy.omg.domain.game.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PlayerMoveRequest (
        double[] position,
        double[] direction,
        boolean actionToggle,
        boolean isTrading,
        boolean isCarrying,
        String animation
) {
}
