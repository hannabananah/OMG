package com.ssafy.omg.domain.socket.dto;

public record StompResponsePayload<T> (
        String type,
        T data
) {
}
