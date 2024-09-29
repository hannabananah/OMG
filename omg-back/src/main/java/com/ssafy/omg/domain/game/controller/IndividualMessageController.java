package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.MessageController;
import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.BaseResponse;
import com.ssafy.omg.config.baseresponse.MessageException;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.IndividualMessageDto;
import com.ssafy.omg.domain.game.service.GameBroadcastService;
import com.ssafy.omg.domain.game.service.GameService;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Description;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.CrossOrigin;

import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.OUT_OF_CASH;

@Slf4j
@MessageController
@RequiredArgsConstructor
@CrossOrigin("*")
@Description("거래소 내부 로직")
public class IndividualMessageController {
    private final GameService gameService;
    private final GameBroadcastService gameBroadcastService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final GameRepository gameRepository;

    @MessageMapping("/gold")
    public BaseResponse<?> purchaseGold(@Payload StompPayload<Integer> goldPayload) throws BaseException, MessageException {
        String roomId = goldPayload.getRoomId();
        String userNickname = goldPayload.getSender();
        int purchasedGoldCnt = goldPayload.getData();

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.purchaseGold(roomId, userNickname, purchasedGoldCnt);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("SUCCESS", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return new BaseResponse<>(response);
        } catch (MessageException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("OUT_OF_CASH", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            log.debug("현재 자산이 부족합니다!");
            return new BaseResponse<>(OUT_OF_CASH);
        } catch (BaseException e) {
            return new BaseResponse<>(e.getStatus());
        }
    }

    @MessageMapping("/take-loan")
    public BaseResponse<?> takeLoan(@Payload StompPayload<Integer> userActionPayload) throws BaseException, MessageException {
        String roomId = userActionPayload.getRoomId();
        String userNickname = userActionPayload.getSender();
        int takeLoanAmount = userActionPayload.getData();

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.takeLoan(roomId, userNickname, takeLoanAmount);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("SUCCESS", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return new BaseResponse<>(response);
        } catch (MessageException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("FAIL", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            log.debug(e.getStatus().getMessage());
            return new BaseResponse<>(e.getStatus());
        } catch (BaseException e) {
            return new BaseResponse<>(e.getStatus());
        }
    }

    @MessageMapping("/repay-loan")
    public BaseResponse<?> repayLoan(@Payload StompPayload<Integer> userActionPayload) throws BaseException, MessageException {
        String roomId = userActionPayload.getRoomId();
        String userNickname = userActionPayload.getSender();
        int repayLoanAmount = userActionPayload.getData();

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.repayLoan(roomId, userNickname, repayLoanAmount);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("SUCCESS", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return new BaseResponse<>(response);
        } catch (MessageException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("FAIL", roomId, userNickname, individualMessage);
            log.debug(e.getStatus().getMessage());
            return new BaseResponse<>(e.getStatus());
        } catch (BaseException e) {
            return new BaseResponse<>(e.getStatus());
        }
    }
}
