package com.ssafy.omg.domain.game.dto;

public record ClickStatusDto(
    String firstPlayerNickname,
    String secondPlayerNickname,
    int firstPlayerClickCount,
    int secondPlayerClickCount
) {
}
