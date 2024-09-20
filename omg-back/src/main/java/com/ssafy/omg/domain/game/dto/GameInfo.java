package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.player.dto.PlayerInfo;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class GameInfo {
    private String gameId;
    private int[] currentPosition;
    private Map<String, PlayerInfo> players;
    private int turn;
    private int round;
    private String gameStatus;
    private String startTime;
    private String endTime;
}