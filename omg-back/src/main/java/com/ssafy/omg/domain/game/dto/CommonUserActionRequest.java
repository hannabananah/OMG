package com.ssafy.omg.domain.game.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommonUserActionRequest {
	private String gameId;
	private String sender;
	private int senderIdx;
	private String message;
	private ActionInfo action;
}
