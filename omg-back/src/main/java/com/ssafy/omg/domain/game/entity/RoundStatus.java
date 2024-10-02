package com.ssafy.omg.domain.game.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum RoundStatus {
    TUTORIAL(20),
    ROUND_START(3),         // 3초
    APPLY_PREVIOUS_EVENT(3),
    ECONOMIC_EVENT_NEWS(5),      // 5초
    ROUND_IN_PROGRESS(120), // 120초
    STOCK_FLUCTUATION(0),   // 타이머 정지
    ROUND_END(3),           // 3초
    PREPARING_NEXT_ROUND(5),// 5초
    GAME_FINISHED(3);       // 게임종료

    private final int duration;

    RoundStatus(int duration) {
        this.duration = duration;
    }

    public int getDuration() {
        return duration;
    }

    @JsonValue
    public String getValue() {
        return this.name();
    }

    @JsonCreator
    public static RoundStatus fromValue(String value) {
        for (RoundStatus status : RoundStatus.values()) {
            if (status.name().equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown enum type " + value + ", Allowed values are " + Arrays.toString(values()));
    }
}