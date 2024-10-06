package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.player.dto.PlayerResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameResultResponse {
    private List<PlayerResult> playerResults;
}
