package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.MessageController;
import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.PlayerMoveRequest;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.GameStatus;
import com.ssafy.omg.domain.game.entity.RoundStatus;
import com.ssafy.omg.domain.game.service.GameBroadcastService;
import com.ssafy.omg.domain.game.service.GameScheduler;
import com.ssafy.omg.domain.game.service.GameService;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;

@Slf4j
@MessageController
@RequiredArgsConstructor
@CrossOrigin("*")
public class CommonMessageController {
    private final SimpMessageSendingOperations messagingTemplate;
    private final GameService gameService;
    private final GameBroadcastService gameBroadcastService;
    private final GameRepository gameRepository;
    private final GameScheduler gameScheduler;

    /**
     * 게임 초기화 후 모든 유저에게 Arena 브로드캐스트
     *
     * @param gameInitializationPayload
     * @throws BaseException
     */
    @MessageMapping("/game-initialize")
    public void initializeGame(@Payload StompPayload<Arena> gameInitializationPayload) throws BaseException {
        String roomId = gameInitializationPayload.getRoomId();
        List<String> players = gameRepository.findinRoomPlayerList(roomId);
        Arena arena = gameService.initializeGame(roomId, players);
        gameBroadcastService.startBroadcast(roomId);
        gameScheduler.notifyMainMessage(roomId, "GAME_MANAGER");
        gameScheduler.notifyPlayersIndividualMessage(roomId);

        StompPayload<Arena> response = new StompPayload<>("GAME_INITIALIZED", roomId, "GAME_MANAGER", arena);
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);

    }


    /**
     * gameStatus를 BEFORE_START에서 IN_GAME으로 변경하여 1라운드 시작과 동시에 타이머를 시작함.
     *
     * @param changeGameStatusPayload
     * @throws BaseException
     */
    @MessageMapping("/game-status")
    public void changeGameStatus(@Payload StompPayload<Arena> changeGameStatusPayload) throws BaseException {
        String roomId = changeGameStatusPayload.getRoomId();
        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();
        game.setGameStatus(GameStatus.IN_GAME);
        game.setRoundStatus(RoundStatus.ROUND_START);
        gameRepository.saveArena(roomId, arena);
        StompPayload<Arena> response = new StompPayload<>("GAME_STATUS_CHANGE", roomId, "GAME_MANAGER", arena);
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);

    }

    /*
        GameScheduler 내부로 옮겼습니다
     */
//    @MessageMapping("/game-event")
//    public void createGameEvent(@Payload StompPayload<String> gameEventPayload, StompHeaderAccessor accessor) throws BaseException {
//        String roomId = gameEventPayload.getRoomId();
//        String sessionId = accessor.getSessionId();
//        String message = gameEventPayload.getData();
//
//        StompPayload<GameEventDto> response = new StompPayload<>();
//
//        if (roomId == null || message == null) {
//            log.error("Invalid payload: roomId or message is null");
//            throw new BaseException(REQUEST_ERROR);
//        }
//
//        switch (message) {
//            case "ECONOMIC_EVENT_OCCURED":
////                try {
//                GameEvent gameEvent = gameService.createGameEventNews(roomId);
//                if (gameEvent == null) {
//                    log.error("GameEvent is null for roomId: {}", roomId);
//                    return;
//                }
//
//                GameEventDto responseDto = new GameEventDto(
//                        RoundStatus.ECONOMIC_EVENT_NEWS,
//                        gameEvent.getTitle(),
//                        gameEvent.getContent(),
//                        gameEvent.getValue()
//                );
//                response = new StompPayload<>("ECONOMIC_EVENT_APPLIED", roomId, "GAME_MANAGER", responseDto);
////                } catch (BaseException e) {
////                    log.error("Error applying economic event: {}", e.getStatus().getMessage());
////                    GameEventDto errorDto = new GameEventDto("ERROR", "Error", e.getStatus().getMessage(), 0);
////                    response = new StompPayload<>("ERROR", roomId, "SYSTEM", errorDto);
////                }
//                break;
//
//            default:
//                log.warn("{} 에 일치하는 메시지 타입이 없습니다.", message);
//                return;
//        }
//
//        // /sub/{roomId}/game 구독하는 사용자에게 모두 전송
//        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
//    }

    @MessageMapping("/player-move")
    public void playerMove(@Payload StompPayload<PlayerMoveRequest> message) throws BaseException {
        gameService.movePlayer(message);
    }

//    @MessageMapping("/buy-stock")
//    public void buyStock(@Payload StompPayload<StockRequest> message) throws BaseException, MessageException {
//        gameService.buyStock(message);
//    }

//    /**
//     * 경제 이벤트를 적용하여 주가 및 금리 변동을 처리하는 메서드
//     *
//     * @param gameEventPayload
//     * @throws BaseException
//     */
//    @MessageMapping("/game-event")
//    public void createGameEvent(@Payload StompPayload<String> gameEventPayload) throws BaseException {
//        String roomId = gameEventPayload.getRoomId();
//        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
//
//        // 경제 이벤트를 적용하는 서비스 호출
//        GameEvent appliedEvent = gameService.applyEconomicEvent(roomId);
//
//        if (appliedEvent == null) {
//            log.error("게임 이벤트가 null 입니다. 처리할 수 없습니다.");
//            return;
//        }
//
//        Arena newArena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
//
//
//        // 변경된 게임 상태를 브로드캐스트
//        StompPayload<Arena> response = new StompPayload<>("ECONOMIC_EVENT_APPLIED", roomId, "GAME_MANAGER", newArena);
//        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
//
//        log.info("경제 이벤트가 성공적으로 적용되었습니다. Room ID: {}", roomId);
//    }
}
