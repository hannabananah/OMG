package com.ssafy.omg.domain.game.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserActionRequest {
    private String roomId;
    private String sender;
    private Details details;

    @Getter
    @Setter
    public static class Details {
        private int stockId;
        private int amount;
    }
}
