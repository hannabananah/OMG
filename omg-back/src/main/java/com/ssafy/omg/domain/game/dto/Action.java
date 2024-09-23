package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.player.entity.PlayerAction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Action {
    private PlayerAction type;
    private ActionInfo details;

    @Getter
    @Setter
    public static class ActionInfo {
        private Integer stockId;
        private int amount;
    }
}
