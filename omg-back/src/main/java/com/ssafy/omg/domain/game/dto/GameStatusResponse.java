package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.ActionStatus;
import com.ssafy.omg.domain.game.entity.Game;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameStatusResponse {
    private String roomId;
    private ActionStatus message;
    private Game game;
}
