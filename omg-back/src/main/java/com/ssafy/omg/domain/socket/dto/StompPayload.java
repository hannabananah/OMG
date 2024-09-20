package com.ssafy.omg.domain.socket.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class StompPayload<T> {

    private String type;
    private String roomId;
    private String sender;
    private T data;

}
