package com.ssafy.omg.domain.chat.dto;

import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String sender;
    private String content;
}
