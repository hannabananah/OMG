package com.ssafy.omg.domain.game.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "event")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GameEvent {
    @Id
    @Column(name = "event_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_title", nullable = false)
    private String title;

    @Column(name = "event_content", nullable = false)
    private String content;

    @Column(name = "event_value")
    private int value;

}
