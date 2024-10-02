package com.ssafy.omg.domain.room.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.BaseResponse;
import com.ssafy.omg.domain.room.dto.CommonRoomRequest;
import com.ssafy.omg.domain.room.dto.CommonRoomResponse;
import com.ssafy.omg.domain.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.reactor.ReactorProperties;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ReactorProperties reactorProperties;

    // TODO
    // User 정보 AccessToken에서 HttpServletRequest로부터 getAttribute해서 userNickname 가져올 것.
    // 임시로 닉네임 부여해서 테스트 진행

    /**
     * 대기방 생성
     *
     * @param userNickname
     * @return response
     * @throws BaseException
     */
    @PostMapping("/create")
    public BaseResponse<String> createRoom(@RequestParam String userNickname) throws BaseException {
        String roomId = roomService.createRoom(userNickname);
        log.info("Room created: {}, User: {}", roomId, userNickname);
        return new BaseResponse<>(roomId);
    }

    /**
     * 대기방 입장
     *
     * @param request
     * @return response
     * @throws BaseException
     */
    @PostMapping("/enter")
    public BaseResponse<CommonRoomResponse> enterRoom(@RequestBody CommonRoomRequest request) throws BaseException {
        CommonRoomResponse response = roomService.enterRoom(request);
        log.info("User {} entered room {}", request.getSender(), request.getRoomId());
        return new BaseResponse<>(response);
    }

    /**
     * 대기방 존재 여부 체크
     *
     * @param roomId 확인할 방 ID
     * @return 방 존재 여부
     * @throws BaseException
     */
    @GetMapping("")
    public BaseResponse<Boolean> checkRoomExists(@RequestParam String roomId) throws BaseException {
        boolean isExists = roomService.isRoomExists(roomId);
        log.info("대기 방 존재 여부 체크 : {} 방 존재여부 : {}", roomId, isExists);
        return new BaseResponse<>(isExists);
    }

    /**
     * 대기방 나가기
     *
     * @param request
     * @return response
     * @throws BaseException
     */
//    @PostMapping("/leave")
//    public BaseResponse<CommonRoomResponse> leaveRoom(@RequestBody CommonRoomRequest request) throws BaseException {
//        CommonRoomResponse response = roomService.leaveRoom(request);
//        return new BaseResponse<>(response);
//    }

    /**
     * 게임 시작 버튼 활성화
     *
     * @param request
     * @return response
     * @throws BaseException
     */
//    @GetMapping("")
//    public BaseResponse<Boolean> isStartButtonActive(@RequestBody CommonRoomRequest request) throws BaseException {
//        boolean isButtonActive = roomService.isStartButtonActive(request);
//        return new BaseResponse<>(isButtonActive);
//    }

    /**
     * 특정 사용자 렌더링 완료
     *
     * @param request 특정 사용자 렌더링 완료
     * @return response
     * @throws BaseException
     */
//    @PostMapping("/render-complete")
//    public BaseResponse<CommonRoomResponse> handleRenderedComplete(@RequestBody CommonRoomRequest request) throws BaseException {
//        CommonRoomResponse response = roomService.handleRenderedComplete(request);
//        return new BaseResponse<>(response);
//    }

    /**
     * @param roomId 모든 사용자 렌더링 상태 확인할 방 번호
     * @return response
     * @throws BaseException
     */
//    @GetMapping("/{roomId}")
//    public BaseResponse<CommonRoomResponse> checkAllRenderedCompleted(@PathVariable String roomId) throws BaseException {
//        CommonRoomResponse response = roomService.checkAllRenderedCompleted(roomId);
//        return new BaseResponse<>(response);
//    }

    /**
     * 게임 시작 버튼 클릭으로 게임 시작
     *
     * @param request
     * @return response
     * @throws BaseException
     */
//    @PostMapping("/start")
//    public BaseResponse<Object> clickStartButton(@RequestBody CommonRoomRequest request) throws BaseException {
//        CommonRoomResponse response = roomService.clickStartButton(request);
//
//        // WebSocket을 통해 게임 시작 메시지를 브로드캐스트
//        messagingTemplate.convertAndSend("/sub/" + request.getRoomId() + "/game",
//                new CommonRoomResponse(request.getRoomId(), request.getSender(), "GAME_START", null, response.getRoom()));
//
//        return new BaseResponse<>(response);
//    }
}