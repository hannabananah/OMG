package com.ssafy.omg.domain.game.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter(AccessLevel.PROTECTED)
@Table(name = "event")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GameEvent {
    @Id
    @Column(name = "event_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_title", nullable = false, length = 200)
    private String title;

    @Column(name = "event_content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "event_value", nullable = false)
    private int value;

    @Column(name = "affected_stock_group", nullable = false, length = 10)
    private String affectedStockGroup;

}
