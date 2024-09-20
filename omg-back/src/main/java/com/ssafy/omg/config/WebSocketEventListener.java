package com.ssafy.omg.config;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.room.dto.CommonRoomRequest;
import com.ssafy.omg.domain.room.dto.CommonRoomResponse;
import com.ssafy.omg.domain.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomService roomService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        logger.info("웹소켓 연결 성공. 헤더억세서 세션아이디 : {}", sessionId);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String userNickname = (String) headerAccessor.getSessionAttributes().get("userNickname");
        String roomId = (String) headerAccessor.getSessionAttributes().get("roomId");

        logger.info("웹소켓 연결 해제. 헤더억세서 세션아이디 : {}, 유저닉네임 : {}, 방코드: {}", sessionId, userNickname, roomId);


        if (userNickname != null && roomId != null) {
            logger.info("연결 해제 : " + userNickname);
            try {
                CommonRoomResponse response = roomService.leaveRoom(new CommonRoomRequest(roomId, userNickname, "LEAVE_GAME"));
                messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            } catch (BaseException e) {
                logger.error("Error processing user disconnect: ", e);
            }
        }
    }
}
