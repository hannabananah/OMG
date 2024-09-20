package com.ssafy.omg.domain.room.entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InRoomPlayer implements Serializable {
    private String nickname;
    private boolean isRendered;
}