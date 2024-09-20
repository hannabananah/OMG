package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.game.service.GameService;
import com.ssafy.omg.domain.room.dto.CommonRoomRequest;
import com.ssafy.omg.domain.room.dto.CommonRoomResponse;
import com.ssafy.omg.domain.room.entity.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

@Slf4j
@Controller
@EnableScheduling
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
}
