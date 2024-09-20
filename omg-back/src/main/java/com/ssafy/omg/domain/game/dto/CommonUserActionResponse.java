package com.ssafy.omg.domain.game.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommonUserActionResponse {
	private String gameId;
	private String message;
	private ActionInfo action;
	private GameSimpleInfo game;
	private String reason;
}
