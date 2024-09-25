package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.MessageController;
import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.GameEventDto;
import com.ssafy.omg.domain.game.dto.PlayerMoveRequest;
import com.ssafy.omg.domain.game.dto.UserActionRequest;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.GameEvent;
import com.ssafy.omg.domain.game.entity.GameStatus;
import com.ssafy.omg.domain.game.entity.RoundStatus;
import com.ssafy.omg.domain.game.service.GameBroadcastService;
import com.ssafy.omg.domain.game.service.GameService;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Optional;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.REQUEST_ERROR;

@Slf4j
@MessageController
@RequiredArgsConstructor
@CrossOrigin("*")
public class GameMessageController {
    private final SimpMessageSendingOperations messagingTemplate;
    private final GameService gameService;
    private final GameBroadcastService gameBroadcastService;
    private final GameRepository gameRepository;

    /**
     * 게임 초기화 후 모든 유저에게 Arena 브로드캐스트
     *
     * @param gameInitializationPayload
     * @throws BaseException
     */
    @MessageMapping("/game-initialize")
    public void initializeGame(@Payload StompPayload<Arena> gameInitializationPayload) throws BaseException {
        String roomId = gameInitializationPayload.getRoomId();
        List<String> players = gameRepository.findPlayerList(roomId);
        Arena arena = gameService.initializeGame(roomId, players);
//        gameBroadcastService.startBroadcast(roomId);

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
        Arena arena = gameRepository.findArenaByRoomId(roomId);
        Game game = arena.getGame();
        game.setGameStatus(GameStatus.IN_GAME);
        game.setRoundStatus(RoundStatus.ROUND_START);
        gameRepository.saveArena(roomId, arena);
        StompPayload<Arena> response = new StompPayload<>("GAME_STATUS_CHANGE", roomId, "GAME_MANAGER", arena);
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);

    }

    @MessageMapping("/game-event")
    public void createGameEvent(@Payload StompPayload<String> gameEventPayload, StompHeaderAccessor accessor) throws BaseException {
        String roomId = gameEventPayload.getRoomId();
        String sessionId = accessor.getSessionId();
        String message = gameEventPayload.getData();

        StompPayload<GameEventDto> response = new StompPayload<>();

        if (roomId == null || message == null) {
            log.error("Invalid payload: roomId or message is null");
            throw new BaseException(REQUEST_ERROR);
        }

        switch (message) {
            case "ECONOMIC_EVENT_OCCURED":
//                try {
                GameEvent gameEvent = gameService.createGameEventandInterestChange(roomId);
                if (gameEvent == null) {
                    log.error("GameEvent is null for roomId: {}", roomId);
                    return;
                }

                GameEventDto responseDto = new GameEventDto(
                        "ECONOMIC_EVENT_APPLIED",
                        gameEvent.getTitle(),
                        gameEvent.getContent(),
                        gameEvent.getValue()
                );
                response = new StompPayload<>("ECONOMIC_EVENT_APPLIED", roomId, "GAME_MANAGER", responseDto);
//                } catch (BaseException e) {
//                    log.error("Error applying economic event: {}", e.getMessage());
//                    GameEventDto errorDto = new GameEventDto("ERROR", "Error", e.getMessage(), 0);
//                    response = new StompPayload<>("ERROR", roomId, "SYSTEM", errorDto);
//                }
                break;

            default:
                log.warn("{} 에 일치하는 메시지 타입이 없습니다.", message);
                return;
        }

        // /sub/{roomId}/game 구독하는 사용자에게 모두 전송
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }

    @MessageMapping("/player-move")
    public void playerMove(@Valid @Payload PlayerMoveRequest playerMoveRequest) throws BaseException {
        gameService.movePlayer(playerMoveRequest);
    }

    @MessageMapping("/game.takeLoan")
    public void takeLoan(@Payload StompPayload<UserActionRequest> message) throws BaseException {
        validateUserAction(message);

        gameService.takeLoan(message.getData());
    }

    @MessageMapping("/game.repayLoan")
    public void repayLoan(@Payload StompPayload<UserActionRequest> message) throws BaseException {
        validateUserAction(message);

        gameService.repayLoan(message.getData());
    }

    // 주식 매도
    // TODO 주식 관련 메서드는 synchronized

    // 주식 매수
    // TODO 주식 관련 메서드는 synchronized

    // 금괴 매입

    /**
     * UserActionRequest의 입력유효성 검사
     *
     * @param message
     * @throws BaseException data나 details가 null인 경우 체크
     */
    private void validateUserAction(StompPayload<UserActionRequest> message) throws BaseException {
        Optional.ofNullable(message.getData())
                .map(UserActionRequest::getDetails)
                .orElseThrow(() -> new BaseException(REQUEST_ERROR));
    }
}
