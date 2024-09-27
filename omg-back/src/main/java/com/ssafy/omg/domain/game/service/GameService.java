package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.MessageException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.dto.PlayerMoveRequest;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.GameEvent;
import com.ssafy.omg.domain.socket.dto.StompPayload;

import java.util.List;

public interface GameService {

    // 진행중인(활성화된) 게임 리스트 반환
    List<Game> getAllActiveGames() throws BaseException;

    // 게임 변경 값을 Arena에 저장
    void saveGame(Game game) throws BaseException;

    // 게임 초기값 세팅
    Arena initializeGame(String roomId, List<String> inRoomPlayers) throws BaseException;

    // 경제 이벤트 발생(조회) 및 금리 변동 (2~10라운드)
    GameEvent createGameEventandInterestChange(String roomId) throws BaseException;

    void takeLoan(StompPayload<Integer> userActionPayload) throws BaseException;
    // 매입한 금괴 개수를 플레이어 자산 및 금괴 매입 트랙( + 추가개수)에 반영
    void purchaseGold(String roomId, String userNickname, int goldButCount) throws BaseException, MessageException;

    // 주가 변동 가능 여부
    boolean isStockFluctuationAble(String roomId) throws BaseException;

    void repayLoan(StompPayload<Integer> userActionPayload) throws BaseException;

    void sellStock(StompPayload<int[]> userActionPayload) throws BaseException;

    void movePlayer(StompPayload<PlayerMoveRequest> playerMoveRequest) throws BaseException;
}
