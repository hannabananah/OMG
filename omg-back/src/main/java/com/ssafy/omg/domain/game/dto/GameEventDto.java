package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.RoundStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GameEventDto {
    private RoundStatus roundStatus;
    private String title;
    private String content;
    private int value;
}
