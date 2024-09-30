package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.RoundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameNotificationDto {
    RoundStatus roundStatus;
    String message;
}
