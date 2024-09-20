package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.MessageController;
import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.game.dto.PlayerMoveRequest;
import com.ssafy.omg.domain.game.dto.UserActionRequest;
import com.ssafy.omg.domain.game.service.GameService;
import com.ssafy.omg.domain.room.dto.CommonRoomRequest;
import com.ssafy.omg.domain.room.dto.CommonRoomResponse;
import com.ssafy.omg.domain.room.entity.Room;
import jakarta.validation.Valid;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Optional;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.REQUEST_ERROR;

@Slf4j
@MessageController
@RequiredArgsConstructor
@CrossOrigin("*")
public class GameMessageController {
    private final SimpMessageSendingOperations messagingTemplate;
    private final GameService gameService;

    @MessageMapping("/game-init")
    public synchronized void manageGame(CommonRoomRequest request, StompHeaderAccessor accessor) throws BaseException {
        String roomId = request.getRoomId();
        String sender = request.getSender();
        String sessionId = accessor.getSessionId();
        String message = request.getMessage();

        CommonRoomResponse response = null;
        Room updatedRoom;

        switch (message) {
            case "ENTER_ROOM":

                break;

            case "LEAVE_ROOM":

                break;

            case "START_BUTTON_CLICKED":

                break;

            case "RENDERED_COMPLETE":

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

    // TODO 주식 관련 메서드는 synchronized

    @MessageMapping("/game.takeLoan")
    public void takeLoan(@Payload StompPayload<UserActionRequest> message) throws BaseException {
        validateUserAction(message);
        UserActionRequest data = message.getData();

        gameService.takeLoan(data.getRoomId(), data.getSender(), data.getDetails().getAmount());
    }

    /**
     * UserAction 요청의 입력유효성 검사
     *
     * @param message
     * @throws BaseException data나 action이나 details가 null인 경우 체크
     */
    private void validateUserAction(StompPayload<UserActionRequest> message) throws BaseException {
        Optional.ofNullable(message.getData())
                .map(UserActionRequest::getDetails)
                .orElseThrow(() -> new BaseException(REQUEST_ERROR));
    }
}
