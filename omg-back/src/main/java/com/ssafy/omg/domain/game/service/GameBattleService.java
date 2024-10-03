package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.MessageException;
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
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;
import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.PLAYER_NOT_FOUND;
import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.ALREADY_IN_BATTLE;
import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.INVALID_GAME_TIME;
import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.PLAYER_WITH_NO_ASSETS;

@Service
@RequiredArgsConstructor
public class GameBattleService {

    private final GameRepository gameRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    private final Map<String, Thread> waitingTimers = new ConcurrentHashMap<>();

    private static final int MIN_TIME_LIMIT = 30;
    private final int[] emptyStocks = new int[6];

    public void handleBattleRequest(StompPayload<BattleRequestDto> payload) throws BaseException, MessageException {
        String requesterNickname = payload.getSender();
        String receiverNickname = payload.getData().receiverNickname();
        String roomId = payload.getRoomId();

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();
        validateGameTime(game, roomId, requesterNickname);

        List<Player> players = game.getPlayers();
        Player receiver = findPlayerByNickname(players, receiverNickname);
        Player requester = findPlayerByNickname(players, receiverNickname);

        validateReceiverState(receiver, roomId, requesterNickname);
        setPlayersToBattleState(requester, receiver, arena, roomId);

        notifyBattleRequest(roomId, requesterNickname, receiverNickname);

        startWaitingTimer(roomId, requester, receiver);

    }

    private void notifyBattleRequest(String roomId, String requesterNickname, String receiverNickname) {
        StompPayload<BattleRequestDto> response = new StompPayload<>(
                "BATTLE_REQUEST", roomId, requesterNickname, new BattleRequestDto(receiverNickname)
        );
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }

    private void setPlayersToBattleState(Player requester, Player receiver, Arena arena, String roomId) {
        receiver.setBattleState(true);
        requester.setBattleState(true);
        gameRepository.saveArena(roomId, arena);
    }

    private void validateReceiverState(Player receiver, String roomId, String requesterNickname) throws MessageException {
        if (receiver.isBattleState()) {
            throw new MessageException(roomId, requesterNickname, ALREADY_IN_BATTLE);
        }

        if (receiver.getCarryingGolds() == 0 && Arrays.equals(receiver.getCarryingStocks(), emptyStocks)) {
            throw new MessageException(roomId, requesterNickname, PLAYER_WITH_NO_ASSETS);
        }
    }

    private void validateGameTime(Game game, String roomId, String requesterNickname) throws BaseException, MessageException {
        int currentTime = game.getTime();
        if (currentTime <= MIN_TIME_LIMIT) {
            throw new MessageException(roomId, requesterNickname, INVALID_GAME_TIME);
        }
    }

    private Player findPlayerByNickname(List<Player> players, String nickname) throws BaseException {
        return players.stream()
                .filter(player -> player.getNickname().equals(nickname))
                .findFirst()
                .orElseThrow(() -> new BaseException(PLAYER_NOT_FOUND));
    }

    private void startWaitingTimer(String roomId, Player requester, Player receiver) {
        String timerKey = getTimerKey(roomId, requester, receiver);

        Thread waitingTimer = Thread.ofVirtual().start(() -> {
            try {
                Thread.sleep(6000);
                cancelWaitingTimer(roomId, requester, receiver);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        waitingTimers.put(timerKey, waitingTimer);
    }

    // TODO 플레이어 상태 복구
    private void cancelWaitingTimer(String roomId, Player requester, Player receiver) {
        String timerKey = getTimerKey(roomId, requester, receiver);

        if(waitingTimers.containsKey(timerKey)) {
            Thread waitingTimer = waitingTimers.get(timerKey);
            waitingTimer.interrupt();
            waitingTimers.remove(timerKey);
        }
    }

    private String getTimerKey(String roomId, Player requester, Player receiver) {
        return roomId + "-" + requester + "-" + receiver;
    }

}
