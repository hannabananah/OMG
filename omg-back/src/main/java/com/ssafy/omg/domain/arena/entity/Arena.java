package com.ssafy.omg.domain.arena.entity;

import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.room.entity.Room;
import lombok.*;

import java.io.Serializable;

/**
 * 레디스 벨류에 들어갈 값
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Arena implements Serializable {
    private String roomId;
    private String message;
    private Game game;
    private Room room;
}
