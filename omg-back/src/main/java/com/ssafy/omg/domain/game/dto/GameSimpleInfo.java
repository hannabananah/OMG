package com.ssafy.omg.domain.game.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameSimpleInfo {
	private PlayerAfterActionInfo player;
	private int turn;
	private int round;
}
