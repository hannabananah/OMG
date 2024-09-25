package com.ssafy.omg.domain.socket.dto;

public record StompExceptionPayload(
        String type,
        String sender
) {
}
