package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.BaseResponse;
import com.ssafy.omg.config.baseresponse.MessageException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.service.GameBroadcastService;
import com.ssafy.omg.domain.game.service.GameService;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import jdk.jfr.Description;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.OUT_OF_CASH;

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
    public BaseResponse<?> takeLoan(@RequestBody StompPayload<Integer> data) throws BaseException {
        gameService.takeLoan(data);
        return new BaseResponse<>("대출이 성공적으로 처리되었습니다.");
    }

    @PostMapping("/repay-loan")
    public BaseResponse<?> repayLoan(@RequestBody StompPayload<Integer> data) throws BaseException {
        gameService.repayLoan(data);
        return new BaseResponse<>("상환이 성공적으로 처리되었습니다.");
    }

    @PostMapping("/sell-stock")
    public BaseResponse<?> sellStock(@RequestBody StompPayload<int[]> data) throws BaseException {
        gameService.sellStock(data);
        return new BaseResponse<>("주식 매도가 성공적으로 처리되었습니다.");
    }
}
