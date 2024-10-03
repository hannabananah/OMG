package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.BattleRequestDto;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.player.entity.Player;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;

@Service
@RequiredArgsConstructor
public class GameBattleService {

    private final GameRepository gameRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    private final int[] emptyStocks = new int[6];

    public void handleBattleRequest(StompPayload<BattleRequestDto> payload) throws BaseException {
        String requesterNickname = payload.getSender();
        String receiverNickname = payload.getData().receiverNickname();
        String roomId = payload.getRoomId();
        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();
        int currentTime = game.getTime();
        if(currentTime <= 30) {
            // TODO 시간 30초 이하라는 예외 던지기
        }
        List<Player> players = game.getPlayers();
        for(Player p : players) {
            if(p.getNickname().equals(receiverNickname)) {
                if(p.isBattleState()) {
                    // TODO 이미 배틀 중인 상대이므로 배틀 상태라는 예외 던지기
                }
                if(p.getCarryingGolds() == 0 && Arrays.equals(p.getCarryingStocks(), emptyStocks)) {
                    // TODO 가진 자산이 없는 상대라는 예외 던지기
                }
            }
        }

        StompPayload response = new StompPayload("BATTLE_REQUEST", roomId, requesterNickname, new BattleRequestDto(receiverNickname));
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }

}
