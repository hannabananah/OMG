package com.ssafy.omg.domain.player.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum PlayerAnimation {
    IDLE,
    WALKING,
    RUNNING;

    @JsonValue
    public String getValue() {
        return this.name().toLowerCase();
    }

    @JsonCreator
    public static PlayerAnimation fromValue(String value) {
        return Arrays.stream(PlayerAnimation.values())
                .filter(enumValue -> enumValue.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown enum type " + value));
    }
}