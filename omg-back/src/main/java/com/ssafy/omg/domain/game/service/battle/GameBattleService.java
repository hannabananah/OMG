package com.ssafy.omg.domain.game.service.battle;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.MessageException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.BattleClickDto;
import com.ssafy.omg.domain.game.dto.BattleRequestDto;
import com.ssafy.omg.domain.game.dto.BattleResultDto;
import com.ssafy.omg.domain.game.dto.ClickStatusDto;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.service.GameService;
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
import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameBattleService {

    private final GameRepository gameRepository;
    private final GameService gameService;
    private final SimpMessageSendingOperations messagingTemplate;

    private final Map<String, Thread> waitingTimers = new ConcurrentHashMap<>();
    private final Map<String, Thread> battleTimers = new ConcurrentHashMap<>();
    private final Map<String, BattleState> battleStateMap = new ConcurrentHashMap<>();

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

        validateBattleState(requester, receiver, roomId);

        // 배틀 요청 중복 방지
        if (receiver.isBattleRequestPending()) {
            log.warn("플레이어 {}에게 이미 진행 중인 배틀 요청이 있습니다 (방 ID: {})", receiverNickname, roomId);
            throw new MessageException(roomId, requesterNickname, BATTLE_REQUEST_ALREADY_PENDING);
        }

        setPlayersToBattleState(requester, receiver, arena, roomId);
        receiver.setBattleRequestPending(true, requesterNickname);
        gameRepository.saveArena(roomId, arena);

        notifyBattleRequest("BATTLE_REQUEST", roomId, requesterNickname, receiverNickname);

        startWaitingTimer(roomId, requesterNickname, receiverNickname);

        log.info("배틀 요청 처리 완료, 방 ID: {}", roomId);
    }

    public void rejectBattleRequest(StompPayload<BattleRequestDto> payload) throws BaseException {
        String receiverNickname = payload.getSender();
        String requesterNickname = payload.getData().opponentPlayer();
        String roomId = payload.getRoomId();
        updatePlayerStateAndCancelWaitingTimer(roomId, requesterNickname, receiverNickname);
        notifyBattleRequest("BATTLE_REQUEST_IS_REJECTED", roomId, requesterNickname, receiverNickname);

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Player receiver = gameService.findPlayer(arena, receiverNickname);
        Player requester = gameService.findPlayer(arena, requesterNickname);
        receiver.clearBattleRequest();
        requester.clearBattleRequest();
        gameRepository.saveArena(roomId, arena);
    }

    public void acceptBattleRequest(StompPayload<BattleRequestDto> payload) throws BaseException {
        String receiverNickname = payload.getSender();
        String requesterNickname = payload.getData().opponentPlayer();
        String roomId = payload.getRoomId();

        cancelWaitingTimer(roomId, requesterNickname, receiverNickname);

        startBattleTimer(roomId, requesterNickname, receiverNickname);
        notifyBattleRequest("BATTLE_START", roomId, requesterNickname, receiverNickname);

        startBattle(roomId, requesterNickname, receiverNickname);

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Player receiver = gameService.findPlayer(arena, receiverNickname);
        Player requester = gameService.findPlayer(arena, requesterNickname);
        receiver.clearBattleRequest();
        requester.clearBattleRequest();
        gameRepository.saveArena(roomId, arena);
    }

    public void updateClickCount(StompPayload<BattleClickDto> payload) {
        String roomId = payload.getRoomId();
        String requesterNickname = payload.getSender();
        String firstPlayerNickname = payload.getData().firstPlayerNickname();
        String secondPlayerNickname = payload.getData().secondPlayerNickname();
        String mapKey = getHashMapKey(roomId, firstPlayerNickname, secondPlayerNickname);

        BattleState battleState = battleStateMap.get(mapKey);
        battleState.updateClickCount(requesterNickname);
    }

    private void startBattle(String roomId, String requesterNickname, String receiverNickname) {
        String battleStateKey = getHashMapKey(roomId, requesterNickname, receiverNickname);
        BattleState battleState = new BattleState();
        battleState.updateClickCount(requesterNickname);
        battleState.updateClickCount(receiverNickname);
        battleStateMap.put(battleStateKey, battleState);
    }

    private void startBattleTimer(String roomId, String requesterNickname, String receiverNickname) {
        String timerKey = getHashMapKey(roomId, requesterNickname, receiverNickname);

        Thread battleTimer = Thread.ofVirtual().start(() -> {
            try {
                for (int i = 0; i < 12; i++) {
                    notifyPlayerClickStatus(roomId, requesterNickname, receiverNickname);
                    Thread.sleep(1000);
                }
                endBattleAndSendResult(roomId, requesterNickname, receiverNickname);
            } catch (InterruptedException | BaseException e) {
                Thread.currentThread().interrupt();
            }
        });
        battleTimers.put(timerKey, battleTimer);
    }

    private void endBattleAndSendResult(String roomId, String requesterNickname, String receiverNickname) throws BaseException {
        String timerKey = getHashMapKey(roomId, requesterNickname, receiverNickname);

        if (battleTimers.containsKey(timerKey)) {
            Thread battleTimer = battleTimers.get(timerKey);
            battleTimer.interrupt();
            battleTimers.remove(timerKey);
            log.info("배틀 타이머 종료 완료: 방 ID {}, {}와 {}", roomId, requesterNickname, receiverNickname);
        } else {
            log.warn(" 배틀 타이머를 찾을 수 없음: 방 ID {}, {}와 {}", roomId, requesterNickname, receiverNickname);
        }

        BattleState battleState = battleStateMap.get(timerKey);
        int requesterClicks = battleState.getClickCount(requesterNickname);
        int receiverClicks = battleState.getClickCount(receiverNickname);

        BattleResultDto battleResultDto = null;

        if (requesterClicks > receiverClicks) {
            updatePlayerBalance(roomId, requesterNickname, receiverNickname);
            battleResultDto = new BattleResultDto(requesterNickname, receiverNickname, requesterNickname);
        } else if (requesterClicks < receiverClicks) {
            updatePlayerBalance(roomId, receiverNickname, requesterNickname);
            battleResultDto = new BattleResultDto(requesterNickname, receiverNickname, receiverNickname);
        } else {
            battleResultDto = new BattleResultDto(requesterNickname, receiverNickname, null);
        }

        StompPayload<BattleResultDto> response = new StompPayload<>("BATTLE_RESULT", roomId, null, battleResultDto);
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }

    private void updatePlayerBalance(String roomId, String winnerNickname, String loserNickname) throws BaseException {
        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        List<Player> players = arena.getGame().getPlayers();
        Player winner = findPlayerByNickname(players, winnerNickname);
        Player loser = findPlayerByNickname(players, loserNickname);

        int loserGold = loser.getCarryingGolds();
        loser.setCarryingGolds(0);
        loser.setGoldOwned(loser.getGoldOwned() - loserGold);
        winner.setCarryingGolds(winner.getCarryingGolds() + loserGold);
        winner.setGoldOwned(winner.getGoldOwned() + loserGold);

        int[] loserStocks = loser.getCarryingStocks();
        int[] loserAllStocks = loser.getStock();
        int[] winnerStocks = winner.getCarryingStocks();
        int[] winnerAllStocks = winner.getStock();

        for (int i = 1; i < 6; i++) {
            winnerAllStocks[i] += loserStocks[i];
        }
        for (int i = 1; i < 6; i++) {
            winnerStocks[i] += loserStocks[i];
        }
        for (int i = 1; i < 6; i++) {
            loserAllStocks[i] -= loserStocks[i];
            loserStocks[i] = 0;
        }

        gameRepository.saveArena(roomId, arena);
    }

    private void notifyPlayerClickStatus(String roomId, String requesterNickname, String receiverNickname) {
        BattleState battleState = battleStateMap.get(roomId);
        StompPayload<ClickStatusDto> response = new StompPayload<>(
                "CLICK_STATUS", roomId, null, new ClickStatusDto(
                requesterNickname, receiverNickname, battleState.getClickCount(requesterNickname), battleState.getClickCount(receiverNickname)
        )
        );
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }

    private void notifyBattleRequest(String messageType, String roomId, String requesterNickname, String receiverNickname) {
        log.info("배틀 요청 알림: {} -> {} (방 ID: {})", requesterNickname, receiverNickname, roomId);
        StompPayload<BattleRequestDto> response = new StompPayload<>(
                messageType, roomId, requesterNickname, new BattleRequestDto(receiverNickname)
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

    private void validateBattleState(Player requester, Player receiver, String roomId) throws MessageException {
        String receiverNickname = receiver.getNickname();
        String requesterNickname = requester.getNickname();
        log.debug("상대방 {} 및 요청한 사람{}의 배틀 상태, 지갑 확인 (방 ID: {})", receiverNickname, requesterNickname, roomId);

        if (receiver.isBattleState()) {
            log.warn("플레이어 {}는 이미 배틀 중입니다 (방 ID: {})", receiverNickname, roomId);
            throw new MessageException(roomId, requesterNickname, ALREADY_IN_BATTLE);
        }

        if (receiver.getCarryingGolds() == 0 && Arrays.equals(receiver.getCarryingStocks(), emptyStocks)) {
            log.warn("상대 플레이어 {}는 자산이 없습니다 (방 ID: {})", receiverNickname, roomId);
            throw new MessageException(roomId, requesterNickname, PLAYER_WITH_NO_ASSETS);
        }

        if (requester.getCarryingGolds() == 0 && Arrays.equals(requester.getCarryingStocks(), emptyStocks)) {
            log.warn("요청자 플레이어 {}는 자산이 없습니다 (방 ID: {})", requesterNickname, roomId);
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
        String timerKey = getHashMapKey(roomId, requesterNickname, receiverNickname);
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

    private void resetBattleState(String roomId, String requesterNickname, String receiverNickname) throws BaseException {
        log.info("플레이어 배틀 상태 해제: 방 ID {}, {}와 {}", roomId, requesterNickname, receiverNickname);

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        List<Player> players = arena.getGame().getPlayers();
        Player updatedRequester = findPlayerByNickname(players, requesterNickname);
        Player updatedReceiver = findPlayerByNickname(players, receiverNickname);

        updatedRequester.setBattleState(false);
        updatedReceiver.setBattleState(false);

        gameRepository.saveArena(roomId, arena);

        log.info("플레이어 배틀 상태 해제 완료: 방 ID {}", roomId);
    }

    private void cancelWaitingTimer(String roomId, String requesterNickname, String receiverNickname) {
        String timerKey = getHashMapKey(roomId, requesterNickname, receiverNickname);

        if (waitingTimers.containsKey(timerKey)) {
            Thread waitingTimer = waitingTimers.get(timerKey);
            waitingTimer.interrupt();
            waitingTimers.remove(timerKey);
            log.info("타이머 종료 완료: 방 ID {}, {}와 {}", roomId, requesterNickname, receiverNickname);
        } else {
            log.warn("타이머를 찾을 수 없음: 방 ID {}, {}와 {}", roomId, requesterNickname, receiverNickname);
        }
    }

    private void updatePlayerStateAndCancelWaitingTimer(String roomId, String requesterNickname, String receiverNickname) throws BaseException {
        resetBattleState(roomId, requesterNickname, receiverNickname);
        cancelWaitingTimer(roomId, requesterNickname, receiverNickname);
    }

    private String getHashMapKey(String roomId, String requesterNickname, String receiverNickname) {
        return roomId + "-" + requesterNickname + "-" + receiverNickname;
    }

}
