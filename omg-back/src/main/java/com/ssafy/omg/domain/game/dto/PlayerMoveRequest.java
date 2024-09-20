package com.ssafy.omg.domain.game.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PlayerMoveRequest (
        @NotNull String roomId,
        @NotNull String nickname,
        @NotNull @Size(min = 3, max = 3) double[] position,
        @NotNull @Size(min = 3, max = 3) double[] direction
) {
}
