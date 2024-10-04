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
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
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
        String receiverNickname = payload.getData().opponentPlayer();
        String roomId = payload.getRoomId();

        log.info("배틀 요청 처리 중: {}가 {}에게 배틀 요청, 방 ID: {}", requesterNickname, receiverNickname, roomId);

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        log.debug("방 ID {}에 대한 아레나 조회 성공", roomId);

        Game game = arena.getGame();
        validateGameTime(game, roomId, requesterNickname);

        List<Player> players = game.getPlayers();
        Player receiver = findPlayerByNickname(players, receiverNickname);
        Player requester = findPlayerByNickname(players, receiverNickname);

        log.debug("요청자: {}, 상대자: {}", requester.getNickname(), receiver.getNickname());

        validateReceiverState(requester, receiver, roomId, requesterNickname);
        setPlayersToBattleState(requester, receiver, arena, roomId);

        notifyBattleRequest(roomId, requesterNickname, receiverNickname);

        startWaitingTimer(roomId, requesterNickname, receiverNickname);

        log.info("배틀 요청 처리 완료, 방 ID: {}", roomId);
    }

    private void notifyBattleRequest(String roomId, String requesterNickname, String receiverNickname) {
        log.info("배틀 요청 알림: {} -> {} (방 ID: {})", requesterNickname, receiverNickname, roomId);
        StompPayload<BattleRequestDto> response = new StompPayload<>(
                "BATTLE_REQUEST", roomId, requesterNickname, new BattleRequestDto(receiverNickname)
        );
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }

    private void setPlayersToBattleState(Player requester, Player receiver, Arena arena, String roomId) {
        log.debug("플레이어 상태 설정: {}와 {}를 배틀 상태로 전환 (방 ID: {})", requester.getNickname(), receiver.getNickname(), roomId);
        receiver.setBattleState(true);
        requester.setBattleState(true);
        gameRepository.saveArena(roomId, arena);
        log.info("플레이어 상태 저장 완료, 방 ID: {}", roomId);
    }

    private void validateReceiverState(Player requester, Player receiver, String roomId, String requesterNickname) throws MessageException {
        log.debug("상대자의 배틀 상태 확인: {} (방 ID: {})", receiver.getNickname(), roomId);

        if (receiver.isBattleState()) {
            log.warn("플레이어 {}는 이미 배틀 중입니다 (방 ID: {})", receiver.getNickname(), roomId);
            throw new MessageException(roomId, requesterNickname, ALREADY_IN_BATTLE);
        }

        if (receiver.getCarryingGolds() == 0 && Arrays.equals(receiver.getCarryingStocks(), emptyStocks)) {
            log.warn("상대 플레이어 {}는 자산이 없습니다 (방 ID: {})", receiver.getNickname(), roomId);
            throw new MessageException(roomId, requesterNickname, PLAYER_WITH_NO_ASSETS);
        }

        if (requester.getCarryingGolds() == 0 && Arrays.equals(requester.getCarryingStocks(), emptyStocks)) {
            log.warn("요청자 플레이어 {}는 자산이 없습니다 (방 ID: {})", requester.getNickname(), roomId);
            throw new MessageException(roomId, requesterNickname, PLAYER_WITH_NO_ASSETS);
        }
    }


    private void validateGameTime(Game game, String roomId, String requesterNickname) throws BaseException, MessageException {
        int currentTime = game.getTime();
        log.debug("게임 시간 확인: {}초 (방 ID: {})", currentTime, roomId);
        if (currentTime <= MIN_TIME_LIMIT) {
            log.warn("유효하지 않은 게임 시간: {}초 (방 ID: {})", currentTime, roomId);
            throw new MessageException(roomId, requesterNickname, INVALID_GAME_TIME);
        }
    }

    private Player findPlayerByNickname(List<Player> players, String nickname) throws BaseException {
        log.debug("플레이어 조회: 닉네임 {}", nickname);
        return players.stream()
                .filter(player -> player.getNickname().equals(nickname))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("플레이어를 찾을 수 없음: 닉네임 {}", nickname);
                    return new BaseException(PLAYER_NOT_FOUND);
                });
    }

    private void startWaitingTimer(String roomId, String requesterNickname, String receiverNickname) {
        String timerKey = getTimerKey(roomId, requesterNickname, receiverNickname);
        log.info("대기 타이머 시작: 방 ID {}, {}와 {}", roomId, requesterNickname, receiverNickname);

        Thread waitingTimer = Thread.ofVirtual().start(() -> {
            try {
                log.debug("6초 대기 중, 배틀: {}와 {}", requesterNickname, receiverNickname);
                Thread.sleep(6000);
                updatePlayerStateAndCancelWaitingTimer(roomId, requesterNickname, receiverNickname);
            } catch (InterruptedException | BaseException e) {
                log.error("타이머가 중단되었거나 에러 발생, 방 ID: {}. 이유: {}", roomId, e.getMessage());
                Thread.currentThread().interrupt();
            }
        });

        waitingTimers.put(timerKey, waitingTimer);
    }

    private void updatePlayerStateAndCancelWaitingTimer(String roomId, String requesterNickname, String receiverNickname) throws BaseException {
        log.info("플레이어 상태 업데이트 및 타이머 취소: 방 ID {}, {}와 {}", roomId, requesterNickname, receiverNickname);

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        List<Player> players = arena.getGame().getPlayers();
        Player updatedRequester = findPlayerByNickname(players, requesterNickname);
        Player updatedReceiver  = findPlayerByNickname(players, receiverNickname);

        updatedRequester.setBattleState(false);
        updatedReceiver.setBattleState(false);

        gameRepository.saveArena(roomId, arena);

        String timerKey = getTimerKey(roomId, requesterNickname, receiverNickname);
        if (waitingTimers.containsKey(timerKey)) {
            Thread waitingTimer = waitingTimers.get(timerKey);
            waitingTimer.interrupt();
            waitingTimers.remove(timerKey);
        }

        log.info("플레이어 상태 초기화 및 타이머 취소 완료, 방 ID: {}", roomId);
    }

    private String getTimerKey(String roomId, String requesterNickname, String receiverNickname) {
        return roomId + "-" + requesterNickname + "-" + receiverNickname;
    }

    public void rejectBattleRequest(StompPayload<BattleRequestDto> payload) throws BaseException {
        String receiverNickname = payload.getSender();
        String requesterNickname = payload.getData().opponentPlayer();
        String roomId = payload.getRoomId();
        updatePlayerStateAndCancelWaitingTimer(roomId, requesterNickname, receiverNickname);
        StompPayload<BattleRequestDto> response = new StompPayload<>(
                "BATTLE_REQUEST_IS_REJECTED", roomId, requesterNickname, new BattleRequestDto(receiverNickname)
        );
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }
}
