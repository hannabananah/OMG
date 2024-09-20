package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.dto.PlayerMoveRequest;

import java.util.List;

public interface GameService {
    // 게임 초기값 세팅
    Arena initializeGame(String roomId, List<String> inRoomPlayers) throws BaseException;

    int preLoan(String roomId, String sender) throws BaseException;

    void takeLoan(String roomId, String sender, int amount) throws BaseException;

    void movePlayer(PlayerMoveRequest playerMoveRequest) throws BaseException;
}
