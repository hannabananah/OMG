package com.ssafy.omg.domain.game.dto;

public record BattleResultDto(
        String firstPlayerNickname,
        String secondPlayerNickname,
        String winnerNickname
) {
}
