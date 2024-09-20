package com.ssafy.omg.domain.room.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.room.dto.CommonRoomRequest;
import com.ssafy.omg.domain.room.dto.CommonRoomResponse;
import com.ssafy.omg.domain.room.entity.Room;
import com.ssafy.omg.domain.room.service.RoomService;
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
public class RoomMessageController {
    private final SimpMessageSendingOperations messagingTemplate;
    private final RoomService roomService;

    @MessageMapping("/room")
    public synchronized void manageRoom(CommonRoomRequest request, StompHeaderAccessor accessor) throws BaseException {
        String roomId = request.getRoomId();
        String sender = request.getSender();
        String sessionId = accessor.getSessionId();
        String message = request.getMessage();

        CommonRoomResponse response;
        Room updatedRoom;

        switch (message) {
            case "ENTER_ROOM":
                response = roomService.enterRoom(request);
                updatedRoom = response.getRoom();
                log.info("{} 가 {}에 입장했습니다.", sender, roomId);
                break;

            case "LEAVE_ROOM":
                response = roomService.leaveRoom(request);
                updatedRoom = response.getRoom();
                log.info("유저 {} 가 {} 방에서 퇴장했습니다.", sender, roomId);
                break;

            case "START_BUTTON_CLICKED":
                response = roomService.clickStartButton(request);
                updatedRoom = response.getRoom();
                log.info("{} 방에서 게임 시작 버튼이 클릭되었습니다.", roomId);
                break;

            case "RENDERED_COMPLETE":
                response = roomService.handleRenderedComplete(request);
                updatedRoom = response.getRoom();
                log.info("유저 {}의 렌더링이 완료되었습니다.", sender);

                // 모든 플레이어의 렌더링이 완료되었는지 확인
                if (roomService.isAllRenderedCompleted(roomId)) {
                    CommonRoomResponse allRenderedResponse = new CommonRoomResponse(roomId, "SYSTEM", "ALL_RENDERED_COMPLETED", null, updatedRoom);
                    messagingTemplate.convertAndSend("/sub/" + roomId + "/room", allRenderedResponse);
                    log.info("{} 방의 모든 플레이어 렌더링이 완료되었습니다.", roomId);
                }
                break;

            default:
                log.warn("{} 에 일치하는 메시지 타입이 없습니다.", message);
                return;
        }

        // /sub/{roomId}/room 구독하는 사용자에게 모두 전송
        messagingTemplate.convertAndSend("/sub/" + roomId + "/room", response);
    }
}
