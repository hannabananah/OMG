package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.PlayerResponse;
import com.ssafy.omg.domain.player.entity.Player;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;
import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.PLAYER_NOT_FOUND;

@Slf4j
@Service
@RequiredArgsConstructor
@Getter
public class GameBroadcastService {

    private final Map<String, ScheduledExecutorService> schedulerMap = new ConcurrentHashMap<>();
    private final SimpMessageSendingOperations messagingTemplate;
    private final GameRepository gameRepository;


    public void startBroadcast(String roomId) {
        log.info("Starting broadcast for roomId: {}", roomId);
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleWithFixedDelay(() -> {
            try {
                broadcastPlayerPositions(roomId);
            } catch (BaseException e) {
                log.error("방 {} 브로드캐스트 실패", roomId, e);
                stopBroadcast(roomId);
            }
        }, 0, 16, TimeUnit.MILLISECONDS);
        schedulerMap.put(roomId, scheduler);
    }

    public void stopBroadcast(String roomId) {
        log.info("Stopping broadcast for roomId: {}", roomId);
        ScheduledExecutorService scheduler = schedulerMap.get(roomId);
        if(scheduler != null && !scheduler.isShutdown()) {
            scheduler.shutdown();
            schedulerMap.remove(roomId);
        }
    }

    private void broadcastPlayerPositions(String roomId) throws BaseException {
        Arena arena = gameRepository.findArenaByRoomId(roomId);
        if (arena == null || arena.getGame() == null) {
            log.warn("No arena or game found for roomId: {}", roomId);
            throw new BaseException(ARENA_NOT_FOUND);
        }
        List<Player> players = arena.getGame().getPlayers();
        if (players == null || players.isEmpty()) {
            log.warn("No players found for roomId: {}", roomId);
            throw new BaseException(PLAYER_NOT_FOUND);
        }

        List<PlayerResponse> playerResponses = players.stream()
                .map(player -> new PlayerResponse(player.getNickname(), player.getPosition(), player.getDirection()))
                .toList();
        log.info("Broadcasting player positions to roomId {}: {}", roomId, playerResponses);
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", playerResponses);
    }
}
