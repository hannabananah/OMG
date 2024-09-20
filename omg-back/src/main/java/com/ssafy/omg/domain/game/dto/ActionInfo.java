package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.player.entity.PlayerAction;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActionInfo {
	private PlayerAction type;
	private ActionDetailInfo details;
}
