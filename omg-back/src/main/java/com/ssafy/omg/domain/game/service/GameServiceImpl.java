package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.PlayerMoveRequest;
import com.ssafy.omg.domain.game.entity.*;
import com.ssafy.omg.domain.game.repository.GameEventRepository;
import com.ssafy.omg.domain.player.entity.Player;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.*;
import static com.ssafy.omg.domain.player.entity.PlayerStatus.NOT_STARTED;
import static org.hibernate.query.sqm.tree.SqmNode.log;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final RedisTemplate<String, Arena> redisTemplate;
    // Redis에서 대기방 식별을 위한 접두사 ROOM_PREFIX 설정
    private static final String ROOM_PREFIX = "room";
    private final int[][] LOAN_RANGE = new int[][]{{50, 100}, {150, 300}, {500, 1000}};
    private static List<Integer> characterTypes = new ArrayList<>(Arrays.asList(0, 1, 2, 3));
    private final GameEventRepository gameEventRepository;
    private final GameRepository gameRepository;
    private final StockState stockState;

    /**
     * 진행중인 게임의 리스트를 반환 ( 모든 진행중인 게임들을 관리 )
     *
     * @return
     * @throws BaseException
     */
    @Override
    public List<Game> getAllActiveGames() throws BaseException {
        List<Arena> allArenas = gameRepository.findAllArenas();
        return allArenas.stream()
                .map(Arena::getGame)
                .filter(game -> game != null && game.getGameStatus() == GameStatus.IN_GAME)
                .collect(Collectors.toList());
    }

    /**
     * Game의 값이 변경됨에 따라 바뀐 값을 Arena에 반영하여 redis에 업데이트
     *
     * @param game
     * @throws BaseException
     */
    @Override
    public void saveGame(Game game) throws BaseException {
        Arena arena = gameRepository.findArenaByRoomId(game.getGameId())
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        arena.setGame(game);
        gameRepository.saveArena(game.getGameId(), arena);
    }

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
            int[] pocket = new int[]{0, 23, 23, 23, 23, 23};
            StockInfo[] market = initializeMarket();
            putRandomStockIntoMarket(pocket, market);

            // 캐릭터 종류
            characterTypes = new ArrayList<>(Arrays.asList(0, 1, 2, 3));
            Collections.shuffle(characterTypes);

            for (int i = 0; i < inRoomPlayers.size(); i++) {
                int[] randomStock = generateRandomStock();
                // pocket에서 뽑은 randomStock 만큼 빼주기
                for (int j = 1; j < randomStock.length; j++) {
                    pocket[j] -= randomStock[j];
                    if (pocket[j] < 0) {
                        throw new BaseException(INSUFFICIENT_STOCK);
                    }
                }

                int characterType = characterTypes.remove(0);

                Player newPlayer = Player.builder()
                        .nickname(inRoomPlayers.get(i))
                        .characterType(characterType)
                        .position(new double[]{0, 0, 0}) // TODO 임시로 (0,0,0)으로 해뒀습니다 고쳐야함
                        .direction(new double[]{0, 0, 0}) // TODO 임시로 (0,0,0)으로 해뒀습니다 고쳐야함
                        .hasLoan(0)
                        .loanPrincipal(0)
                        .loanInterest(0)
                        .totalDebt(0)
                        .cash(100)
                        .stock(randomStock)
                        .goldOwned(0)
                        .action(null)
                        .state(NOT_STARTED)
                        .isConnected(1)
                        .build();
                players.add(newPlayer);
            }

            int[] randomEvent = generateRandomEvent();

            Game newGame = Game.builder()
                    .gameId(roomId)
                    .gameStatus(GameStatus.BEFORE_START)  // 게임 대기 상태로 시작
                    .message("GAME_INITIALIZED")
                    .players(players)
                    .time(5)                            // 한 라운드 2분(120초)으로 설정
                    .round(1)                             // 시작 라운드 1
                    .roundStatus(null)
                    .isStockChanged(new boolean[6])       // 5개 주식에 대한 변동 여부 초기화
                    .isGoldChanged(false)
                    .currentInterestRate(5)               // 예: 초기 금리 5%로 설정
                    .economicEvent(randomEvent)           // 초기 경제 이벤트 없음
                    .currentStockPriceLevel(0)            // 주가 수준
                    .stockTokensPocket(pocket)            // 주머니 초기화
                    .marketStocks(market)                 // 주식 시장 초기화
                    .stockSellTrack(new int[10])          // 주식 매도 트랙 초기화
                    .stockBuyTrack(new int[6])            // 주식 매수 트랙 초기화
                    .goldBuyTrack(new int[6])             // 금 매입 트랙 초기화
                    .goldPrice(20)                        // 초기 금 가격 20
                    .goldPriceIncreaseCnt(0)          // 초기 금괴 매입 개수 0
                    .build();

            arena.setGame(newGame);
            arena.setMessage("GAME_INITIALIZED");
            arena.setRoom(null);
            gameRepository.saveArena(roomId, arena);
        } else {
            throw new BaseException(ARENA_NOT_FOUND);
        }
        return arena;
    }

    private StockInfo[] initializeMarket() {
        StockInfo[] market = new StockInfo[6];
        market[0] = new StockInfo(0, new int[]{0, 0});

        for (int i = 1; i < 6; i++) {
            market[i] = new StockInfo(8, new int[]{12, 3});
        }

        return market;
    }

    /**
     * 경제 이벤트 발생(조회) 및 금리 변동 (2~10라운드)
     *
     * @param roomId 방 코드
     * @return 경제 이벤트 정보 반환
     * @throws BaseException
     */
    @Override
    public GameEvent createGameEventandInterestChange(String roomId) throws BaseException {
        String roomKey = ROOM_PREFIX + roomId;
        Arena arena = redisTemplate.opsForValue().get(roomKey);
        Game game = arena.getGame();

        int currentRound = game.getRound();
        if (currentRound < 2 || currentRound > 10) {
            log.info("경제 이벤트는 2라운드 부터 발생합니다.");
            throw new BaseException(INVALID_ROUND);
        }

        int[] economicEvent = game.getEconomicEvent();
        if (economicEvent == null) {
            throw new BaseException(EVENT_NOT_FOUND);
        }

        Long eventId = (long) economicEvent[currentRound];
        GameEvent gameEvent = gameEventRepository.findById(eventId)
                .orElseThrow(() -> new BaseException(EVENT_NOT_FOUND));

        // 금리 변동 반영
        int currentInterestRate = game.getCurrentInterestRate();
        currentInterestRate += gameEvent.getValue();
        if (currentInterestRate < 1) {
            currentInterestRate = 1;
        } else if (currentInterestRate > 10) {
            currentInterestRate = 10;
        }
        game.setCurrentInterestRate(currentInterestRate);

        arena.setGame(game);
        gameRepository.saveArena(roomId, arena);

        return gameEvent;
    }

    private int[] putRandomStockIntoMarket(int[] pocket, StockInfo[] market) throws BaseException {
        Random random = new Random();
        int totalCount = 20;
        int[] count = new int[5];

        // 각각 최소1개씩
        for (int i = 0; i < 5; i++) {
            count[i] = 1;
            totalCount -= 1;
        }

        // 나머지 랜덤 나누기
        while (totalCount > 0) {
            int index = random.nextInt(5);
            if (count[index] < 7) {  // 한 주식당 최대 7개로 제한 (1 + 최대 6)
                count[index]++;
                totalCount--;
            }
        }

        // pocket에서 주식을 빼고 market에 넣기
        for (int i = 0; i < 5; i++) {
            if (pocket[i + 1] < count[i]) {
                throw new BaseException(INSUFFICIENT_STOCK);
            }
            pocket[i + 1] -= count[i];
            market[i + 1].setCnt(market[i + 1].getCnt() + count[i]);
        }

        int maxCnt = Arrays.stream(count).max().getAsInt();
        int minCnt = Arrays.stream(count).min().getAsInt();
        for (int i = 0; i < 5; i++) {
            if (count[i] == maxCnt) {
                int[] currentState = market[i + 1].getState();
                market[i + 1].setState(new int[]{currentState[0], currentState[1] - 1});
            }
            if (count[i] == minCnt) {
                int[] currentState = market[i + 1].getState();
                market[i + 1].setState(new int[]{currentState[0], currentState[1] + 1});
            }
        }

        return pocket;
    }

    public int[] generateRandomStock() throws BaseException {
        Random random = new Random();
        int[] result = new int[6];
        result[0] = 0;
        int remainingStockCounts = 5;

        for (int i = 1; i < 5; i++) {
            if (remainingStockCounts > 0) {
                // 최소값은 0, 최대값은 남은 주식수와 3중 작은값
                int max = Math.min(remainingStockCounts, 3);
                result[i] = random.nextInt(max + 1);
                remainingStockCounts -= result[i];
            } else {
                result[i] = 0;
            }
        }
        result[5] = remainingStockCounts;
        return result;
    }

    private int[] generateRandomEvent() throws BaseException {
        Random random = new Random();
        Set<Integer> selectedEconomicEvents = new HashSet<>();
        int[] result = new int[11];
        for (int i = 2; i < result.length; i++) {
            int eventIdx;
            int attempts = 0;
            do {
                eventIdx = random.nextInt(22) + 1;
                if (attempts > 50) {
                    throw new BaseException(EVENT_NOT_FOUND);
                }
            } while (selectedEconomicEvents.contains(eventIdx));
            result[i] = eventIdx;
            selectedEconomicEvents.add(eventIdx);
        }
        return result;
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

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Player player = findPlayer(arena, sender);

        // 이미 대출을 받은 적이 있는 경우
        if (player.getHasLoan() == 1) {
            throw new BaseException(LOAN_ALREADY_TAKEN);
        }

        int stockPriceLevel = arena.getGame().getCurrentStockPriceLevel();

        // 주가 수준에 따른 가능 대출 범위 리턴
        // 유효하지 않은 주가수준일 경우
        if (stockPriceLevel < 0 || stockPriceLevel > 9) {
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
     * @param userActionPayload
     * @throws BaseException 요청 금액이 대출 한도를 넘어가는 경우
     */
    @Override
    public void takeLoan(StompPayload<Integer> userActionPayload) throws BaseException {
        String roomId = userActionPayload.getRoomId();
        String sender = userActionPayload.getSender();
        int amount = userActionPayload.getData();

        validateRequest(roomId, sender);
        int range = preLoan(roomId, sender);

        // 요청 금액이 대출 한도를 이내인지 검사
        if (amount < LOAN_RANGE[range][0] || LOAN_RANGE[range][1] < amount) {
            throw new BaseException(AMOUNT_OUT_OF_RANGE);
        }

        // 대출금을 자산에 반영
        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Player player = findPlayer(arena, sender);
        int interest = (int) (amount * (arena.getGame().getCurrentInterestRate() / 100.0));
        System.out.println("==================대출 이자============== : " + interest);

        player.setHasLoan(1);
        player.setLoanPrincipal(amount);
        player.setLoanInterest(interest);
        player.setTotalDebt(amount);
        player.setCash(player.getCash() + amount);

        gameRepository.saveArena(roomId, arena);
    }

    // 상환

    /**
     * [repayLoan] 상환 후 자산 반영, 메세지 전송
     *
     * @param userActionPayload
     * @throws BaseException 상환 금액이 유효하지 않은 값일 때
     */
    @Override
    public void repayLoan(StompPayload<Integer> userActionPayload) throws BaseException {
        String roomId = userActionPayload.getRoomId();
        String sender = userActionPayload.getSender();
        int amount = userActionPayload.getData();

        validateRequest(roomId, sender);

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        ;
        Player player = findPlayer(arena, sender);

        // 상환 후 자산에 반영(갚아야 할 금액 차감, 현금 차감)
        player.repayLoan(amount);

        gameRepository.saveArena(roomId, arena);
    }


    // 주식 매도
    @Override
    public void sellStock(StompPayload<int[]> userActionPayload) throws BaseException {
        String roomId = userActionPayload.getRoomId();
        String sender = userActionPayload.getSender();
        int[] sellingStocks = userActionPayload.getData();

        validateRequest(roomId, sender);
        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        Game game = arena.getGame();
        int stockPriceLevel = game.getCurrentStockPriceLevel();
        StockInfo[] market = game.getMarketStocks();
        int[] stockSellTrack = game.getStockSellTrack();

        Player player = findPlayer(arena, sender);
        int[] orgStocks = player.getStock();

        // 주식 매도 (개수는 프론트에서 제한)
        // 0. stocks 유효성 검사 (각 숫자가 0 이상/합산한 개수가 0 초과 주가 수준 거래 가능 토큰 개수 이하)
        validateStocks(orgStocks, sellingStocks, stockPriceLevel);

        // 1. 주식 매도 가격 계산
        int salePrice = 0;  // 주식 매도 대금
        int marketPrice;    // 주가
        for (int i = 1; i < 6; i++) {
            marketPrice = stockState.getStockStandard()[market[i].getState()[0]][market[i].getState()[1]].getPrice();
            salePrice += marketPrice * sellingStocks[i];
            orgStocks[i] -= sellingStocks[i]; // 2. 개인 보유 주식 개수 적용
            market[i].addCnt(sellingStocks[i]);
            System.out.println("개인 보유 주식 개수 적용 " + i + "번째 주식 : " + Arrays.toString(orgStocks));
        }

        // 2. 개인 현금에 매도 가격 적용
        player.addCash(salePrice);
        System.out.println("개인 현금에 매도금 적용 : " + player.getCash());

        // 3. 매도 트랙에서 주식시장으로 토큰 옮기기
        int[] possibleStocks = getStocksFromSellTrack(sellingStocks, stockSellTrack);

        int tokenIdx = selectRandomTokenIndex(possibleStocks);
        System.out.println("매도트랙에서 옮길 토큰 인덱스 : " + tokenIdx);
        stockSellTrack[tokenIdx] -= 1;
        market[tokenIdx].addCnt(1);
        System.out.println("매도 트랙에서 주식시장으로 토큰 옮김(매도 트랙) : " + Arrays.toString(stockSellTrack));
        System.out.println("매도 트랙에서 주식시장으로 토큰 옮김(주식 토큰 개수) : " + market[tokenIdx].getCnt());

        // 4. 주가 하락
        market[tokenIdx].decreaseState();
        // TODO 주가 변동으로 가는 GAME에 적용 안됨
        System.out.println("매도트랙으로 옮긴 주식 주가 하락(주가) : " + Arrays.toString(market[tokenIdx].getState()));

        // 5. 남은 주식토큰이 5개면 주가 변동 -> 주식 매도트랙 세팅
        int leftStocks = 0;
        for (int i = 1; i < 6; i++) {
            leftStocks += stockSellTrack[i];
        }
        if (leftStocks == 5) {
            System.out.println("!!!!!남은 주식이 5개로 주가변동!!!!!");
            changeStockPrice(game, stockPriceLevel);
        }

        // 6. 매도트랙 세팅
        for (int i = 1; i < 6; i++) {
            game.getStockTokensPocket()[i] += stockSellTrack[i];
        }
        game.setStockSellTrack(new int[]{2, 2, 2, 2, 2, 2});

        gameRepository.saveArena(roomId, arena);

    }

    /**
     * 매도 트랙에서 주식시장으로 옮길 수 있는 주식의 종류 return
     *
     * @param stocks
     * @param stockSellTrack
     * @return
     */
    public int[] getStocksFromSellTrack(int[] stocks, int[] stockSellTrack) {
        int[] possibleStocks = new int[6];
        for (int i = 1; i < 6; i++) {
            if (stocks[i] != 0 && stockSellTrack[i] != 0) {
                possibleStocks[i] = 1;
            }
        }

        boolean isAllZero = Arrays.stream(possibleStocks).allMatch(value -> value == 0);
        if (isAllZero) {
            for (int i = 1; i < 6; i++) {
                possibleStocks[i] = (stocks[i] == 0 && stockSellTrack[i] != 0) ? 1 : 0;
            }
        }

        return possibleStocks;
    }

    private int selectRandomTokenIndex(int[] possibleStocks) throws BaseException {
        if (possibleStocks == null || possibleStocks.length < 6) {
            throw new BaseException(INVALID_ARRAY_SIZE);
        }

        List<Integer> possibleIndices = new ArrayList<>();

        for (int i = 1; i < 6; i++) {
            if (possibleStocks[i] == 1) {
                possibleIndices.add(i);
            }
        }

        if (possibleIndices.isEmpty()) {
            throw new BaseException(NO_POSSIBLE_INDICES);
        }

        Random random = new Random();
        int randomIndex = random.nextInt(possibleIndices.size());

        return possibleIndices.get(randomIndex);
    }

    // 주식 매수

    // 금괴 매입

    // 주가 변동
    public void changeStockPrice(Game game, int stockPriceLevel) throws BaseException {
        int[] stockTokensPocket = game.getStockTokensPocket();

        // 1. 현재 주가 수준에 해당하는 주식 토큰의 개수를 뽑기
        Random random = new Random();
        int[] selectedStockCnts = new int[6];

        // 1-1. 인덱스 선택
        List<Integer> validIndices = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            if (stockTokensPocket[i] > 0) {
                validIndices.add(i);
            }
        }

        // 1-2. 주어진 tokensCnt 만큼 랜덤으로 인덱스 선택해서 값 줄이기
        int tokensCnt = stockState.getStockLevelCards()[stockPriceLevel][1];
        for (int i = 0; i < tokensCnt; i++) {
            if (validIndices.isEmpty()) {
                throw new BaseException(INSUFFICIENT_STOCK);
            }

            int randomIndex = validIndices.get(random.nextInt(validIndices.size()));

            stockTokensPocket[randomIndex] -= 1;
            selectedStockCnts[randomIndex] += 1;

            if (stockTokensPocket[randomIndex] == 0) {
                validIndices.remove((Integer) randomIndex);
            }
        }

        System.out.println("[주가변동] 주머니에서 뽑은 주식들 : " + Arrays.toString(selectedStockCnts));
        // 2. 금 시세 조정
        int blackTokenCnt = selectedStockCnts[0];
        if (blackTokenCnt > 0) {
            // 2-1. 검은색 주식 토큰 개수만큼 금 마커를 금 시세 트랙에서 위쪽으로 한 칸씩 이동
            game.addGoldPrice(blackTokenCnt);
            // 2-2. 매입 금괴 표시 트랙에서 금 마커가 마지막으로 지나가거나, 도달한 3의 배수 칸 오른쪽 아래에 표시된 숫자만큼 위쪽으로 이동.
            game.addGoldPrice(game.getGoldPriceIncreaseCnt() / 3);
        }
        // 2-3. 매입 금괴 표시 트랙에 놓인 금 마커를 0으로 이동
        game.setGoldPriceIncreaseCnt(0);

        // 3. 주가 조정
        StockInfo[] marketStocks = game.getMarketStocks();
        if (0 <= blackTokenCnt && blackTokenCnt <= 12) {

            // 3-1. 검은색 토큰 1개: 검은색 토큰을 다시 주머니에 넣고, 나머지 주식 토큰들로 아래 수행
            if (blackTokenCnt == 1) {
                stockTokensPocket[0] += 1;
                selectedStockCnts[0] = 0;
            }
            System.out.println("[주가변동] 1~5번째 주식 주가 조정 시작");
            // 3-2. 뽑은 주식 토큰 中, 각 색깔의 주가 토큰 개수가 표시된 위치로 이동(*주가 조정 참조표* 참고)
            for (int i = 1; i < 6; i++) {
                System.out.println("[주가변동] " + i + "번째 시작!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11");
                int stockCntDiff = selectedStockCnts[i] - selectedStockCnts[0];
                System.out.println("[주가변동] 검은색 주식 개수 : " + selectedStockCnts[0] + " , " + i + "번째 주식 개수 : " + selectedStockCnts[i] + " , 검은색 토큰과의 개수 차이" + stockCntDiff);
                if (stockCntDiff < -6) {
                    throw new BaseException(INVALID_BLACK_TOKEN);
                }
                int[] stockPriceState = marketStocks[i].getState();

                if (0 <= stockCntDiff && stockCntDiff < 7) {
                    System.out.println("[주가변동] 주가 이동 전 좌표" + stockPriceState[0] + ", " + stockPriceState[1]);
                    stockPriceState[0] += stockState.getStockDr()[stockCntDiff];
                    stockPriceState[1] += stockState.getStockDc()[stockCntDiff];
                    System.out.println("[주가변동] 주가 이동 후 좌표" + stockPriceState[0] + ", " + stockPriceState[1]);
                }
                // 3-3. 7개 이상 뽑았다면, 참조표에 표시된 6까지 이동 후 -> 초과한 숫자만큼 위로 한 칸씩 이동
                else if (7 <= stockCntDiff && stockCntDiff <= 12) {
                    System.out.println("[주가변동] 검은 토큰과의 차이 7개 이상");
                    stockPriceState[0] += stockState.getStockDr()[6];
                    stockPriceState[1] += stockState.getStockDc()[6];
                    for (int j = 0; j < stockCntDiff - 6; j++) {
                        if (stockPriceState[0] == 0) {
                            break;
                        }
                        stockPriceState[0] -= 1;
                    }
                } else {
                    throw new BaseException(EXCEEDS_DIFF_RANGE);
                }

                // 4. 주식 토큰 정리: 주머니에서 뽑은 색깔 주식 토큰을 일치하는 색깔의 주식시장에 놓기
                marketStocks[i].addCnt(selectedStockCnts[i]);
                System.out.println("[주가변경] 주식 토큰 정리 후 주식시장 상태 : " + Arrays.toString(marketStocks));

                // 5. 주가 상승: 여전히 주식 시장에 주식 토큰이 없는 색깔은 주가를 위쪽으로 한 칸 이동
                System.out.println("[주가변경] 여전히 주식 시장에 주식 토큰이 없는 색깔 주가 상승 !전! : " + Arrays.toString(stockPriceState));
                if (marketStocks[i].getCnt() == 0) stockPriceState[0] -= 1;
                System.out.println("[주가변경] 여전히 주식 시장에 주식 토큰이 없는 색깔 주가 상승 !후! : " + Arrays.toString(stockPriceState));

                // 6. 주가 수준 변동 조건 확인 후, 필요 시 주가 수준 변동
                int newLevel = stockState.getStockStandard()[stockPriceState[0]][stockPriceState[1]].getLevel();
                // 새로운 주가수준이 상위영역에 처음 진입했는지
                if (stockPriceLevel < newLevel) {
                    System.out.println("[주가변동] 주가변동으로 인한 주가수준변경. 원래 수준 : " + stockPriceLevel + " , 새로운 수준 : " + newLevel);
                    game.setCurrentStockPriceLevel(newLevel);
                    stockPriceLevel = newLevel;
                }
            }
        } else {
            throw new BaseException(INVALID_BLACK_TOKEN);
        }
    }

    // 플레이어 이동
    @Override
    public synchronized void movePlayer(StompPayload<PlayerMoveRequest> payload) throws BaseException {
        String roomId = payload.getRoomId();

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        Player player = findPlayer(arena, payload.getSender());
        PlayerMoveRequest playerMoveRequest = payload.getData();
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
            throw new BaseException(REQUEST_ERROR);
        }
    }

    /**
     * 주식 매수/매도 시 거래 요청한 주식의 검사
     *
     * @param orgStocks       : 플레이어가 보유하고 있는 주식들
     * @param sellingStocks   : 플레이어가 파려고 하는 주식들
     * @param stockPriceLevel : 주가 수준
     * @throws BaseException : 아래 두 조건을 만족하지 않는 경우
     *                       - 각 숫자가 0 미만인 동시에 거래 주식 개수가 0 초과 거래가능토큰개수(주가수준 기준) 이하
     *                       - 주식 종류별 내가 보유한 주식 개수 이하
     */
    private void validateStocks(int[] orgStocks, int[] sellingStocks, int stockPriceLevel) throws BaseException {
        // 각 숫자가 0 이상 && 합산한 개수가 0 초과 주가 수준 거래 가능 토큰 개수 이하 && 내가 보유한 주식 개수 이하
        int stockCnt = 0;
        for (int i = 1; i < 6; i++) {
            if (sellingStocks[i] < 0 || orgStocks[i] < sellingStocks[i]) {
                throw new BaseException(INVALID_SELL_STOCKS);
            }
            stockCnt += sellingStocks[i];
        }

        if (stockCnt > stockState.getStockLevelCards()[stockPriceLevel][0] || stockCnt <= 0) {
            System.out.println("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
            System.out.println("stockCnt: " + stockCnt + " | 지금 거래 가능한 주가 토큰 수 : " + stockState.getStockLevelCards()[stockPriceLevel][0]);
            throw new BaseException(IMPOSSIBLE_STOCK_CNT);
        }
    }
}
