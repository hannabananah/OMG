package com.ssafy.omg.domain.game.repository;

import com.ssafy.omg.domain.game.entity.GameEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameEventRepository extends JpaRepository<GameEvent, Long> {

    // event_id로 경제 이벤트 전제 조회
    Optional<GameEvent> findById(Long id);

    // event_id로 금리 변동 value 조회
    @Query("SELECT ge.value FROM GameEvent ge WHERE ge.id = :id")
    Optional<GameEvent> findValueById(Long id);
}
