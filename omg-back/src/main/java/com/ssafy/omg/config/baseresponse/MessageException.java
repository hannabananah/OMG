package com.ssafy.omg.config.baseresponse;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class MessageException extends Exception {
    private final String roomId;
    private final String sender;
    private final MessageResponseStatus status;
}
