package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.MessageController;
import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.BaseResponse;
import com.ssafy.omg.config.baseresponse.MessageException;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.IndividualMessageDto;
import com.ssafy.omg.domain.game.dto.StockMarketResponse;
import com.ssafy.omg.domain.game.dto.StockRequest;
import com.ssafy.omg.domain.game.entity.Game;
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

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;
import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.PLAYER_STATE_ERROR;
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
            response = new StompPayload<>("SUCCESS_PURCHASE_GOLD", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            sendStockMarketResponse(roomId);
            return new BaseResponse<>(response);
        } catch (MessageException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("OUT_OF_CASH", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            log.debug("현재 자산이 부족합니다!");
            return new BaseResponse<>(OUT_OF_CASH);
        } catch (BaseException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("GOLD_ALREADY_PURCHASED", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return new BaseResponse<>(PLAYER_STATE_ERROR);
        }
    }

    @MessageMapping("/take-loan")
    public BaseResponse<?> takeLoan(@Payload StompPayload<Integer> userActionPayload) throws BaseException {
        String roomId = userActionPayload.getRoomId();
        String userNickname = userActionPayload.getSender();
        int takeLoanAmount = userActionPayload.getData();

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.takeLoan(roomId, userNickname, takeLoanAmount);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("SUCCESS_TAKE_LOAN", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return new BaseResponse<>(response);
        } catch (MessageException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>(e.getStatus().name(), roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            log.debug(e.getStatus().getMessage());
            return new BaseResponse<>(e.getStatus());
        } catch (BaseException e) {
            return new BaseResponse<>(e.getStatus());
        }
    }

    @MessageMapping("/repay-loan")
    public BaseResponse<?> repayLoan(@Payload StompPayload<Integer> userActionPayload) throws BaseException {
        String roomId = userActionPayload.getRoomId();
        String userNickname = userActionPayload.getSender();
        int repayLoanAmount = userActionPayload.getData();

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.repayLoan(roomId, userNickname, repayLoanAmount);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("SUCCESS_REPAY_LOAN", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            return new BaseResponse<>(response);
        } catch (MessageException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>(e.getStatus().name(), roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            log.debug(e.getStatus().getMessage());
            return new BaseResponse<>(e.getStatus());
        } catch (BaseException e) {
            return new BaseResponse<>(e.getStatus());
        }
    }

    @MessageMapping("/sell-stock")
    public BaseResponse<?> sellStock(@Payload StompPayload<StockRequest> userActionPayload) {
        String roomId = userActionPayload.getRoomId();
        String userNickname = userActionPayload.getSender();
        int[] sellStockAmount = userActionPayload.getData().stocks();

        StompPayload<IndividualMessageDto> response = null;
        try {
            gameService.sellStock(roomId, userNickname, sellStockAmount);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId,userNickname);
            response = new StompPayload<>("SUCCESS_SELL_STOCK", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            sendStockMarketResponse(roomId);
            return new BaseResponse<>(response);
        }
//        catch (MessageException e) {
//            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
//            response = new StompPayload<>(e.getStatus().name(), roomId, userNickname, individualMessage);
//            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
//            log.debug(e.getStatus().getMessage());
//            return new BaseResponse<>(e.getStatus());
//        }
        catch (BaseException e) {
            return new BaseResponse<>(e.getStatus());
        }
    }

    @MessageMapping("/buy-stock")
    public void purchaseStock(@Payload StompPayload<StockRequest> payload) throws BaseException {
        String roomId = payload.getRoomId();
        String userNickname = payload.getSender();
        StompPayload<IndividualMessageDto> response = null;

        try {
            gameService.buyStock(payload);
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>("SUCCESS_BUY_STOCK", roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            sendStockMarketResponse(roomId);
        } catch (MessageException e) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(roomId, userNickname);
            response = new StompPayload<>(e.getStatus().name(), roomId, userNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
        }
    }

    public void sendStockMarketResponse(String roomId) {

        try {
            Game game = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND)).getGame();
            StockMarketResponse response = gameService.createStockMarketInfo(game);
            StompPayload<StockMarketResponse> payload = new StompPayload<>("STOCK_MARKET_INFO", game.getGameId(), "GAME_MANAGER", response);
            messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", payload);
        } catch (BaseException e) {
            log.debug("BaseException occurred while sendStockMarketResponse : " + e.getStatus().name());
        }

    }

}
