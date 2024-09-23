package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.PlayerMoveRequest;
import com.ssafy.omg.domain.game.dto.UserActionRequest;
import com.ssafy.omg.domain.game.dto.UserActionResponse;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.GameStatus;
import com.ssafy.omg.domain.player.entity.Player;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.*;
import static com.ssafy.omg.domain.game.entity.ActionStatus.ACTION_FAILURE;
import static com.ssafy.omg.domain.game.entity.ActionStatus.ACTION_SUCCESS;
import static com.ssafy.omg.domain.player.entity.PlayerStatus.NOT_STARTED;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final RedisTemplate<String, Arena> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    // Redis에서 대기방 식별을 위한 접두사 ROOM_PREFIX 설정
    private static final String ROOM_PREFIX = "room";
    private final int[][] LOAN_RANGE = new int[][]{{50, 100}, {150, 300}, {500, 1000}};
    private final GameRepository gameRepository;

    // 초기화

    /**
     * 게임 초기값 설정
     * 게임 시작 전 고정된 초기값을 미리 세팅하여 게임 준비를 함.
     *
     * @param roomId        게임 방 코드
     * @param inRoomPlayers 게임 참여 유저 리스트
     * @return Arena
     * @throws BaseException PLAYER_NOT_FOUND
     */
    @Override
    public Arena initializeGame(String roomId, List<String> inRoomPlayers) throws BaseException {
        if (inRoomPlayers == null || inRoomPlayers.isEmpty()) {
            throw new BaseException(PLAYER_NOT_FOUND);
        }

        Arena arena = redisTemplate.opsForValue().get(ROOM_PREFIX + roomId);
        if (arena != null) {
            List<Player> players = new ArrayList<>();
            for (int i = 0; i < inRoomPlayers.size(); i++) {
                Player newPlayer = Player.builder()
                        .nickname(inRoomPlayers.get(i))
                        .position(new double[]{0, 0, 0}) // TODO 임시로 (0,0,0)으로 해뒀습니다 고쳐야함
                        .direction(new double[]{0, 0, 0}) // TODO 임시로 (0,0,0)으로 해뒀습니다 고쳐야함
                        .hasLoan(0)
                        .loan(0)
//                        .interestRate(0)
                        .cash(100)
                        .stock(new int[]{0, 0, 0, 0, 0, 0})
                        .gold(0)
                        .action(null)
                        .state(NOT_STARTED)
                        .time(20)
                        .isConnected(1)
                        .build();
                players.add(newPlayer);
            }

            Game newGame = Game.builder()
                    .gameId(roomId)
                    .gameStatus(GameStatus.BEFORE_START)  // 게임 대기 상태로 시작
                    .message("GAME_INITIALIZED")
                    .players(players)
                    .time(120)                            // 한 라운드 2분(120초)으로 설정
                    .round(1)                             // 시작 라운드 1
                    .isStockChanged(new boolean[6])       // 5개 주식에 대한 변동 여부 초기화
                    .isGoldChanged(false)
                    .interestRate(5)                      // 예: 초기 금리 5%로 설정
                    .economicEvent(0)                     // 초기 경제 이벤트 없음
                    .stockPriceLevel(0)                   // 주가 수준
                    .pocket(new int[]{0, 23, 23, 23, 23, 23})  // 주머니 초기화
                    .market(new Game.StockInfo[]{
                            new Game.StockInfo(0, new int[]{0, 0}),
                            new Game.StockInfo(8, new int[]{12, 3}),
                            new Game.StockInfo(8, new int[]{12, 3}),
                            new Game.StockInfo(8, new int[]{12, 3}),
                            new Game.StockInfo(8, new int[]{12, 3}),
                            new Game.StockInfo(8, new int[]{12, 3})}) // 주식 시장 초기화
                    .stockSell(new int[10])               // 주식 매도 트랙 초기화
                    .stockBuy(new int[6])                 // 주식 매수 트랙 초기화
                    .goldBuy(new int[6])                  // 금 매입 트랙 초기화
                    .goldPrice(20)                        // 초기 금 가격 20
                    .goldCnt(0)                           // 초기 금괴 매입 개수 0
                    .build();

            arena.setGame(newGame);
            arena.setMessage("GAME_INITIALIZED");
            arena.setRoom(null);
            redisTemplate.opsForValue().set(ROOM_PREFIX + roomId, arena);
        } else {
            throw new BaseException(ARENA_NOT_FOUND);
        }
        return arena;
    }


    // 대출

    /**
     * [preLoan] 대출 가능 여부 판단 후, 대출 금액 범위 리턴
     *
     * @param roomId
     * @param sender
     * @return 대출 금액 범위
     * @throws BaseException 1. 이미 대출을 받은 적이 있는 경우 2. 유효하지 않은 주가수준인 경우
     */
    public int preLoan(String roomId, String sender) throws BaseException {

        // 입력값 오류
        validateRequest(roomId, sender);

        Arena arena = getArena(roomId);
        Player player = getPlayer(arena, sender);

        // 이미 대출을 받은 적이 있는 경우
        if (player.getHasLoan() == 1) {

            // UserActionResponse 보내기
            UserActionResponse response = UserActionResponse.builder()
                    .roomId(roomId)
                    .message(ACTION_FAILURE)
                    .reason(LOAN_ALREADY_TAKEN.getMessage()).build();
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);

            throw new BaseException(LOAN_ALREADY_TAKEN);
        }

        int stockPriceLevel = arena.getGame().getStockPriceLevel();

        // 주가 수준에 따른 가능 대출 범위 리턴
        // 유효하지 않은 주가수준일 경우
        if (stockPriceLevel < 0 || stockPriceLevel > 9) {

            // UserActionResponse 보내기
            UserActionResponse response = UserActionResponse.builder()
                    .roomId(roomId)
                    .message(ACTION_FAILURE)
                    .reason(INVALID_STOCK_LEVEL.getMessage()).build();
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);

            throw new BaseException(INVALID_STOCK_LEVEL);
        } else if (stockPriceLevel <= 2) {
            return 0;
        } else if (stockPriceLevel <= 5) {
            return 1;
        } else {
            return 2;
        }
    }

    /**
     * [takeLoan] 대출 후 자산반영, 메세지 전송
     *
     * @param userActionRequest
     * @throws BaseException 요청 금액이 대출 한도를 넘어가는 경우
     */
    public void takeLoan(UserActionRequest userActionRequest) throws BaseException {
        String roomId = userActionRequest.getRoomId();
        String sender = userActionRequest.getSender();
        int amount = userActionRequest.getDetails().getAmount();

        validateRequest(roomId, sender);
        int range = preLoan(roomId, sender);

        // 요청 금액이 대출 한도를 이내인지 검사
        if (amount <= LOAN_RANGE[range][0] || LOAN_RANGE[range][1] <= amount) {

            // UserActionResponse 보내기
            UserActionResponse response = UserActionResponse.builder()
                    .roomId(roomId)
                    .message(ACTION_FAILURE)
                    .reason(AMOUNT_OUT_OF_RANGE.getMessage()).build();
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);

            throw new BaseException(AMOUNT_OUT_OF_RANGE);
        }

        // 대출금을 자산에 반영
        Arena arena = getArena(roomId);
        Player player = getPlayer(arena, sender);
        int interest = amount * (arena.getGame().getInterestRate() / 100);
        player = player.toBuilder()
                .hasLoan(1)
                .loan(amount)
                .interest(interest)
                .debt(amount + interest)
                .cash(player.getCash() + amount).build();

        savePlayer(roomId, arena, player);

        // UserActionResponse 보내기
        UserActionResponse response = UserActionResponse.builder()
                .roomId(roomId)
                .message(ACTION_SUCCESS)
                .player(player).build();
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }

    // 상환

    /**
     * [repayLoan] 상환 후 자산 반영, 메세지 전송
     *
     * @param userActionRequest
     * @throws BaseException 상환 금액이 유효하지 않은 값일 때
     */
    public void repayLoan(UserActionRequest userActionRequest) throws BaseException {
        String roomId = userActionRequest.getRoomId();
        String sender = userActionRequest.getSender();
        int amount = userActionRequest.getDetails().getAmount();

        validateRequest(roomId, sender);

        Arena arena = getArena(roomId);
        Player player = getPlayer(arena, sender);

        // 상환 금액이 유효한 값인지 판단(음수, 갚아야 할 금액보다 큰 금액인 경우, 자신이 보유한 현금보다 큰 값인 경우)
        if (amount < 0 || player.getDebt() < amount || player.getCash() < amount) {

            // UserActionResponse 보내기
            UserActionResponse response = UserActionResponse.builder()
                    .roomId(roomId)
                    .message(ACTION_FAILURE)
                    .reason(INVALID_REPAY_AMOUNT.getMessage()).build();
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);

            throw new BaseException(INVALID_REPAY_AMOUNT);
        }

        // 상환 후 자산에 반영(갚아야 할 금액 차감, 현금 차감)
        player = player.toBuilder()
                .debt(player.getDebt() - amount)
                .cash(player.getCash() - amount)
                .build();

        savePlayer(roomId, arena, player);

        // UserActionResponse 보내기
        UserActionResponse response = UserActionResponse.builder()
                .roomId(roomId)
                .message(ACTION_SUCCESS)
                .player(player).build();
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
    }


    // 주식 매수

    // 주식 매도

    // 금괴 매입

    // 주가 수준 변동

    // 플레이어 이동
    @Override
    public synchronized void movePlayer(PlayerMoveRequest playerMoveRequest) throws BaseException {
        String roomId = playerMoveRequest.roomId();

        Arena arena = gameRepository.findArenaByRoomId(roomId);

        Player player = findPlayer(arena, playerMoveRequest.nickname());

        player.setDirection(playerMoveRequest.direction());
        player.setPosition(playerMoveRequest.position());

        gameRepository.saveArena(roomId, arena);
    }

    private Player findPlayer(Arena arena, String nickname) throws BaseException {
        return arena.getGame().getPlayers().stream()
                .filter(p -> p.getNickname().equals(nickname))
                .findFirst()
                .orElseThrow(() -> new BaseException(PLAYER_NOT_FOUND));
    }

    /**
     * 요청의 입력유효성 검사
     *
     * @param sender 요청을 보낸 사용자의 닉네임
     * @throws BaseException roomId나 sender가 null이거나 비어있을 경우 발생
     */
    private void validateRequest(String roomId, String sender) throws BaseException {
        if (roomId == null || roomId.isEmpty() || sender == null || sender.isEmpty()) {
            // UserActionResponse 보내기
            UserActionResponse response = UserActionResponse.builder()
                    .roomId(roomId)
                    .message(ACTION_FAILURE)
                    .reason(REQUEST_ERROR.getMessage()).build();
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
            throw new BaseException(REQUEST_ERROR);
        }
    }

    /**
     * Redis에서 arena를 가져오기
     *
     * @param roomId Redis에서 사용하는 방의 키
     * @return 방의 arena
     * @throws BaseException 방을 찾을 수 없을 경우 발생
     */
    private Arena getArena(String roomId) throws BaseException {
        String roomKey = ROOM_PREFIX + roomId;

        Arena arena = redisTemplate.opsForValue().get(roomKey);

        if (arena == null || arena.getGame() == null) {
            throw new BaseException(GAME_NOT_FOUND);
        }
        return arena;
    }


    /**
     * arena에서 sender에 해당하는 player 가져오기
     *
     * @param arena
     * @param sender
     * @return arena game의 players 중 sender에 해당하는 player
     * @throws BaseException
     */
    private Player getPlayer(Arena arena, String sender) throws BaseException {
        List<Player> players = arena.getGame().getPlayers();
        Optional<Player> currPlayer = players.stream()
                .filter(player -> player.getNickname().equals(sender))
                .findFirst();

        if (currPlayer.isEmpty()) {
            throw new BaseException(PLAYER_NOT_FOUND);
        }
        return currPlayer.get();
    }

    /**
     * player의 행위로 인해 변경된 값을 redis에 업데이트
     *
     * @param arena
     * @param currPlayer
     */
    private void savePlayer(String roomId, Arena arena, Player currPlayer) {
        String roomKey = ROOM_PREFIX + roomId;

        arena.getGame().getPlayers().replaceAll(player ->
                player.getNickname().equals(currPlayer.getNickname()) ? currPlayer : player
        );

        redisTemplate.opsForValue().set(roomKey, arena);
    }
}
