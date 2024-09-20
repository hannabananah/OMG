package com.ssafy.omg.domain.player.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlayerInfo {
    private String nickname;
    private int gold;
    private int cash;
    private int[] token;
}