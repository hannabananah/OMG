package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.ActionStatus;
import com.ssafy.omg.domain.player.entity.Player;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserActionResponse {
    private String roomId;
    private ActionStatus message;
    private Player player;
    private String reason;
}
