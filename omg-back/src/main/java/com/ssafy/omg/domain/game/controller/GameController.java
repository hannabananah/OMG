package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.BaseResponse;
import com.ssafy.omg.config.baseresponse.MessageException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.IndividualMessageDto;
import com.ssafy.omg.domain.game.dto.StockRequest;
import com.ssafy.omg.domain.game.service.GameBroadcastService;
import com.ssafy.omg.domain.game.service.GameService;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import jdk.jfr.Description;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.AMOUNT_OUT_OF_RANGE;
import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.OUT_OF_CASH;

@Slf4j
@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
@Description("Postman 테스트용 RestAPI입니다")
public class GameController {
    private final GameService gameService;
    private final GameBroadcastService gameBroadcastService;
    private final SimpMessageSendingOperations messagingTemplate;
    private final GameRepository gameRepository;

    @PostMapping("/initialize")
    public BaseResponse<Arena> initializeGame(@RequestParam String roomId, @RequestBody List<String> players) throws BaseException {
        Arena arena = gameService.initializeGame(roomId, players);
    //    gameBroadcastService.startBroadcast(roomId);
        return new BaseResponse<>(arena);
    }

    @PostMapping("/gold")
    public BaseResponse<?> purchaseGold(@RequestBody StompPayload<Integer> goldPurchasePayload) {
        String roomId = goldPurchasePayload.getRoomId();
        String userNickname = goldPurchasePayload.getSender();
        int purchasedGoldCnt = goldPurchasePayload.getData();

        try {
            gameService.purchaseGold(roomId, userNickname, purchasedGoldCnt);
            return new BaseResponse<>("금괴 매입에 성공했습니다!");
        } catch (MessageException e) {
            if (e.getStatus() == OUT_OF_CASH) {
                return new BaseResponse<>("현재 보유한 자산이 부족하여 금괴를 매입할 수 없습니다.");
            }
            // 다른 MessageException 처리
            return new BaseResponse<>(e.getMessage());
        } catch (BaseException e) {
            // 일단 추가 할 수도 있음
            return new BaseResponse<>(e.getStatus());
        }
    }

    @PostMapping("/end-game")
    public BaseResponse<Void> endGame(@RequestParam String roomId) {
        gameBroadcastService.stopBroadcast(roomId);
        // TODO 게임 종료시 해야할 로직을 호출한다.
        // TODO 게임 결과를 반환해야 한다.
        return new BaseResponse<>(null);
    }

    // 대출
    @PostMapping("/take-loan")
    public StompPayload<?> takeLoan(@RequestBody StompPayload<Integer> userActionPayload) throws BaseException {
        String roomId = userActionPayload.getRoomId();
        String userNickname = userActionPayload.getSender();
        int takeLoanAmount = userActionPayload.getData();

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.takeLoan(roomId, userNickname, takeLoanAmount);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("SUCCESS", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return response;
        } catch (MessageException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("FAIL", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            log.debug(String.valueOf(e.getStatus()));
            log.debug("@@@@@@@@");
            return response;
        } catch (BaseException e) {
            return response;
        }
    }

    @PostMapping("/repay-loan")
    public StompPayload<?> repayLoan(@RequestBody StompPayload<Integer> userActionPayload) throws BaseException {
        String roomId = userActionPayload.getRoomId();
        String userNickname = userActionPayload.getSender();
        int repayLoanAmount = userActionPayload.getData();
        System.out.println("!!!!!!!repayLoan!!!!!!!");

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.repayLoan(roomId, userNickname, repayLoanAmount);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("SUCCESS", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return response;
        } catch (MessageException e) {
            System.out.println("MessageException");
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("FAIL", roomId, userNickname, individualMessage);
            log.debug(e.getStatus().getMessage());
            return response;
        } catch (BaseException e) {
            System.out.println("BaseException");
            return response;
        }
    }

    @PostMapping("/sell-stock")
    public StompPayload<?> sellStock(@RequestBody StompPayload<StockRequest> userActionPayload) throws BaseException, MessageException {
        String roomId = userActionPayload.getRoomId();
        String userNickname = userActionPayload.getSender();
        int[] sellStockAmount = userActionPayload.getData().stocks();

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.sellStock(roomId, userNickname, sellStockAmount);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId,userNickname);
            response = new StompPayload<>("SUCCESS_SELL_STOCK", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return response;
        }
//        catch (MessageException e) {
//            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
//            response = new StompPayload<>(e.getStatus().name(), roomId, userNickname, individualMessage);
//            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
//            log.debug(e.getStatus().getMessage());
//            return response;
//        }
        catch (BaseException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>(e.getStatus().name(), roomId, userNickname, individualMessage);
            return response;
        }
    }
}
