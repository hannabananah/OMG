package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.BaseResponse;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.service.GameBroadcastService;
import com.ssafy.omg.domain.game.service.GameService;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/games")
@RequiredArgsConstructor
public class GameController {
    private final GameService gameService;
    private final GameBroadcastService gameBroadcastService;
    private final SimpMessageSendingOperations messagingTemplate;

    @PostMapping("/initialize")
    public BaseResponse<Arena> initializeGame(@RequestParam String roomId, @RequestBody List<String> players) throws BaseException {
        Arena arena = gameService.initializeGame(roomId, players);
        gameBroadcastService.startBroadcast(roomId);
        return new BaseResponse<>(arena);
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
