package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.MessageException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.*;
import com.ssafy.omg.domain.game.entity.*;
import com.ssafy.omg.domain.game.repository.GameEventRepository;
import com.ssafy.omg.domain.player.dto.PlayerAnimation;
import com.ssafy.omg.domain.player.dto.PlayerResult;
import com.ssafy.omg.domain.player.entity.Player;
import com.ssafy.omg.domain.player.entity.PlayerStatus;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.*;
import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.AMOUNT_OUT_OF_RANGE;
import static com.ssafy.omg.config.baseresponse.MessageResponseStatus.*;
import static com.ssafy.omg.domain.game.entity.RoundStatus.STOCK_FLUCTUATION;
import static com.ssafy.omg.domain.game.entity.RoundStatus.TUTORIAL;
import static com.ssafy.omg.domain.player.entity.PlayerStatus.COMPLETED;
import static com.ssafy.omg.domain.player.entity.PlayerStatus.NOT_STARTED;
import static org.hibernate.query.sqm.tree.SqmNode.log;

@Service
@RequiredArgsConstructor
public class GameServiceImpl implements GameService {

    private final RedisTemplate<String, Arena> redisTemplate;
    // Redis에서 대기방 식별을 위한 접두사 ROOM_PREFIX 설정
    private static final String ROOM_PREFIX = "room";
    private static List<Integer> characterTypes = new ArrayList<>(Arrays.asList(0, 1, 2, 3));
    private final GameEventRepository gameEventRepository;
    private final GameRepository gameRepository;
    private final StockState stockState;
    private Random random = new Random();
    private final SimpMessageSendingOperations messagingTemplate;

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
     * 메인판 정보 반환
     *
     * @param roomId
     * @param sender
     * @return
     * @throws BaseException
     */
    @Override
    public MainMessageDto getMainMessage(String roomId, String sender) throws BaseException {
        Arena arena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();

        int[] stockPrices = Arrays.stream(game.getMarketStocks())
                .map(stockInfo -> {
                    int[] state = stockInfo.getState();
                    return stockState.getStockStandard()[state[0]][state[1]].getPrice();
                })
                .mapToInt(Integer::intValue)
                .toArray();
        int goldPrice = game.getGoldPrice();
        int currentInterestRate = game.getCurrentInterestRate();
        int stockPriceLevel = game.getCurrentStockPriceLevel();
        int tradableCount = stockState.getTradableCount(stockPriceLevel);
        int remainingUntilChange = 20 * (10 - Arrays.stream(game.getStockSellTrack()).skip(1).limit(5).sum());

        return MainMessageDto.builder()
                .stockPrices(stockPrices)
                .goldPrice(goldPrice)
                .currentInterestRate(currentInterestRate)
                .currentStockPriceLevel(stockPriceLevel)
                .tradableStockCnt(tradableCount)
                .remainingUntilChange(remainingUntilChange)
                .build();
    }

    /**
     * 거래소에서 응답으로 보낼 DTO 생성 메서드
     *
     * @param roomId
     * @param sender
     * @return
     * @throws BaseException
     */
    @Override
    public IndividualMessageDto getIndividualMessage(String roomId, String sender) throws BaseException {

        Arena arena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Player player = findPlayer(arena, sender);

        return IndividualMessageDto.builder()
                .loanProducts(player.getLoanProducts())
                .totalDebt(player.getTotalDebt())
                .loanLimit(0)
                .currentLoanPrincipal(0)
                .cash(player.getCash())
                .stock(player.getStock())
                .goldOwned(player.getGoldOwned())
                .carryingStocks(player.getCarryingStocks())
                .carryingGolds(player.getCarryingGolds())
                .action(player.getAction())
                .state(player.getState())
                .build();
    }

    /**
     * 주식 거래소 정보 생성
     *
     * @param game
     * @return StockMarketInfo
     */
    @Override
    public StockMarketResponse createStockMarketInfo(Game game) {
        List<Player> players = game.getPlayers();
        String[] playerNicknames = players.stream()
                .map(Player::getNickname)
                .toList().toArray(new String[0]);

        StockInfo[] marketStocks = game.getMarketStocks();
        int[][] playerStockShares = new int[6][4];
        int[] leftStocks = new int[6];
        int[] stockPrices = new int[6];
//        int[] recentStockPriceChanges = new int[6];

        for (int i = 1; i < 6; i++) {
            // 플레이어 별 보유 주식 개수 (r: 주식 종류 , c: 플레이어 , value: 주식 개수)
            for (int j = 0; j < 4; j++) {
                playerStockShares[i][j] = players.get(j).getStock()[i];
            }

            // 주식 별 남은 주식 개수
            leftStocks[i] = marketStocks[i].getCnt();

            // 주가
            stockPrices[i] = getStockPrice(marketStocks, i);
        }

        return StockMarketResponse.builder()
                .stockPriceChangeInfo(game.getStockPriceChangeInfo())
                .playerNicknames(playerNicknames)
                .playerStockShares(playerStockShares)
                .leftStocks(leftStocks)
                .stockPrices(stockPrices)
                .build();
    }

    /**
     * 금괴 매입소 정보 생성
     *
     * @param game
     * @return
     * @throws BaseException
     */
    @Override
    public GoldMarketInfoResponse createGoldMarketInfo(Game game) throws BaseException {
        List<Player> players = game.getPlayers();
        String[] playerNicknames = players.stream()
                .map(Player::getNickname)
                .toList().toArray(new String[0]);

        int[] playerGoldCounts = players.stream()
                .map(Player::getGoldOwned)
                .mapToInt(Integer::intValue)
                .toArray();

        int[] marketGoldChart = game.getGoldPriceChart();

        int goldPrice = game.getGoldPrice();
        int goldPriceIncreaseCnt = game.getGoldPriceIncreaseCnt();

        return GoldMarketInfoResponse.builder()
                .playerNicknames(playerNicknames)
                .playerGoldCounts(playerGoldCounts)
                .goldPrice(goldPrice)
                .goldPriceIncreaseCnt(goldPriceIncreaseCnt)
                .goldPriceChart(marketGoldChart)
                .build();
    }

    /**
     * 닉네임 순자산 mapEntry로 뽑아 순자산으로 내림차순 정렬해 닉네임(key)만 뽑은 랭킹 배열
     *
     * @param game 게임
     * @return playerRanking 랭킹배열
     * @throws BaseException
     */
    @Override
    public PlayerRankingResponse getPlayerRanking(Game game) throws BaseException {
        String[] playerRanking = game.getPlayers().stream()
                .map(player -> new AbstractMap.SimpleEntry<>(player.getNickname(), calculateNetWorth(game, player)))
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .toArray(String[]::new);

        return new PlayerRankingResponse(playerRanking);
    }

    /**
     * 게임 결과 정보 생성
     *
     * @param game
     * @return
     * @throws BaseException
     */
    @Override
    public GameResultResponse gameResult(Game game) throws BaseException {

        System.out.println("==== Starting Game Result Calculation ====");
        int finalGoldPrice = game.getGoldPrice();
        System.out.println("Final Gold Price: " + finalGoldPrice);

        int[] finalStockPrices = new int[6];
        StockInfo[] marketStocks = game.getMarketStocks();
        for (int i = 1; i < 6; i++) {
            int[] state = marketStocks[i].getState();
            finalStockPrices[i] = stockState.getStockStandard()[state[0]][state[1]].getPrice();
            System.out.println("Final Stock Price for stock " + (i) + ": " + finalStockPrices[i]);
        }

        List<Player> players = game.getPlayers();
        List<PlayerResult> playerResults = new ArrayList<>();
        System.out.println("\n==== Calculating Player Results ====");

        for (Player player : players) {
            System.out.println("\nCalculating for player: " + player.getNickname());
            int finalNetWorth = calculateNetWorth(game, player);
            PlayerResult individualResult = PlayerResult.builder()
                    .nickname(player.getNickname())
                    .finalCash(player.getCash())
                    .finalGoldCnt(player.getGoldOwned())
                    .finalStockCnt(player.getStock())
                    .finalNetWorth(finalNetWorth)
                    .finalDebt(player.getTotalDebt())
                    .finalTax(player.getTax())
                    .build();
            playerResults.add(individualResult);

            System.out.println("Player: " + player.getNickname());
            System.out.println("  Final Gold Count: " + player.getGoldOwned());
            System.out.println("  Final Stock Count: " + Arrays.toString(player.getStock()));
            System.out.println("  Final Net Worth: " + finalNetWorth);
            System.out.println("  Final Debt: " + player.getTotalDebt());
            System.out.println("  Cash: " + player.getCash());
            System.out.println("  Tax: " + player.getTax());
        }

        System.out.println("\n==== Player Results Before Sorting ====");
        for (PlayerResult result : playerResults) {
            System.out.println(result.getNickname() + ": Net worth = " + result.getFinalNetWorth() + ", Cash = " + result.getFinalCash());
        }

        // 순위 정렬
        playerResults.sort((o1, o2) -> Integer.compare(o2.getFinalNetWorth(), o1.getFinalNetWorth()));

        System.out.println("\n==== Final Player Rankings ====");
        for (int i = 0; i < playerResults.size(); i++) {
            PlayerResult result = playerResults.get(i);
            System.out.println((i + 1) + ". " + result.getNickname() + ": Net worth = " + result.getFinalNetWorth() + ", Cash = " + result.getFinalCash());
        }
        System.out.println("\n==== Game Result Calculation Completed ====");

        return GameResultResponse.builder()
                .finalGoldPrice(finalGoldPrice)
                .finalStockPrice(finalStockPrices)
                .playerResults(playerResults)
                .build();
    }

    // 순자산 계산
    private int calculateNetWorth(Game game, Player player) {
        int netWorth = player.getCash();
        int goldPrice = game.getGoldPrice();
        StockInfo[] marketStocks = game.getMarketStocks();

        System.out.println("  Calculating net worth:");
        System.out.println("    Cash: " + netWorth);

        int goldValue = player.getGoldOwned() * goldPrice;
        netWorth += goldValue;
        System.out.println("    Gold value: " + goldValue + " (Gold owned: " + player.getGoldOwned() + ", Gold price: " + goldPrice + ")");

        int stockValue = getStockValue(player.getStock(), marketStocks);
        netWorth += stockValue;
        System.out.println("    Stock value: " + stockValue);

        int debt = player.getTotalDebt();
        netWorth -= debt;
        System.out.println("    Total debt: " + debt);

        int tax = player.getTax();
        netWorth -= tax;
        System.out.println("    Total tax: " + tax);

        System.out.println("    Final net worth: " + netWorth);

        return netWorth;
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
            characterTypes = new ArrayList<>(Arrays.asList(0, 1, 2));
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

                int characterType;
                if (i == 0) {
                    characterType = 3;
                } else {
                    characterType = characterTypes.remove(0);
                }


                Player newPlayer = Player.builder()
                        .nickname(inRoomPlayers.get(i))   // 플레이어 닉네임
                        .characterType(characterType)     // 캐릭터 에셋 종류
                        .characterMovement(false)         // 줍기 행동 유무
                        .position(new double[]{0, 0, 0})  // TODO 임시로 (0,0,0)으로 해뒀습니다 고쳐야함
                        .direction(new double[]{0, 0, 0}) // TODO 임시로 (0,0,0)으로 해뒀습니다 고쳐야함
                        .carryingStocks(new int[]{0, 0, 0, 0, 0, 0})
                        .carryingGolds(0)
                        .loanProducts(new TreeSet<LoanProduct>())
                        .cash(100)                        // 현금
                        .stock(randomStock)               // 보유 주식 개수
                        .goldOwned(0)                     // 보유 금괴 개수

                        .action(null)                     // 플레이어 행위 (주식 매수, 주식 매도, 금괴 매입, 대출, 상환)
                        .state(NOT_STARTED)               // 플레이어 행위 상태 (시작전, 진행중, 완료)
                        .isConnected(1)                   // 플레이어 접속 상태 (0: 끊김, 1: 연결됨)
                        .animation(PlayerAnimation.IDLE)  // 기본상태
                        .tax(0)
                        .build();
                players.add(newPlayer);
            }

            int[] randomEvent = generateRandomEvent();
            int[][] stockPriceChangeInfo = new int[6][61];

            int[] initialStockPrices = Arrays.stream(market)
                    .map(stockInfo -> {
                        int[] state = stockInfo.getState();
                        return stockState.getStockStandard()[state[0]][state[1]].getPrice();
                    })
                    .mapToInt(Integer::intValue)
                    .toArray();
//            System.out.println("++++++++++++++++++++++++++++++++++");
//            System.out.println(Arrays.toString(initialStockPrices));
//            System.out.println("++++++++++++++++++++++++++++++++++");

            for (int i = 1; i < 6; i++) {
                stockPriceChangeInfo[i][0] = initialStockPrices[i - 1];
            }
            int[] goldPriceChart = new int[61];
            goldPriceChart[0] = 20;

            Game newGame = Game.builder()
                    .gameId(roomId)
                    .gameStatus(GameStatus.IN_GAME)          // 게임 대기 상태로 시작
                    .message("GAME_START")
                    .players(players)

                    .time(20)
                    .round(1)                                     // 시작 라운드 1
                    .roundStatus(TUTORIAL)

                    .currentInterestRate(5)                       // 예: 초기 금리 5%로 설정
                    .economicEvent(randomEvent)                   // 초기 경제 이벤트 없음
                    .currentEvent(null)                           // 적용할 경제이벤트 없음
                    .currentStockPriceLevel(0)                    // 주가 수준

                    .stockTokensPocket(pocket)                    // 주머니 초기화
                    .marketStocks(market)                         // 주식 시장 초기화
                    .stockSellTrack(new int[]{1, 2, 2, 2, 2, 2})  // 주식 매도 트랙 초기화
                    .stockBuyTrack(new int[6])                    // 주식 매수 트랙 초기화
                    .goldBuyTrack(new int[6])                     // 금 매입 트랙 초기화

                    .goldPrice(20)                                // 초기 금 가격 20
                    .goldPriceIncreaseCnt(0)                      // 초기 금괴 매입 개수 0

                    .stockPriceChangeInfo(stockPriceChangeInfo)
                    .goldPriceChart(goldPriceChart)
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
/*
        for (int i = 1; i < 6; i++) {
            market[i] = new StockInfo(8, new int[]{12, 3});
        }
*/
        // 시연용 데이터 변경
        for (int i = 1; i < 6; i++) {
            market[i] = new StockInfo(8, new int[]{10, 3});
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
    public GameEvent createGameEventNews(String roomId) throws BaseException {
        Arena arena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();

        int currentRound = game.getRound();
        if (currentRound < 1 || currentRound >= 10) {
            log.info("경제 뉴스는 1라운드부터 9라운드까지 발생합니다.");
            throw new BaseException(EVENT_NOT_FOUND);
        }

        int[] economicEvent = game.getEconomicEvent();
        if (economicEvent == null) {
            log.error("경제 이벤트 배열이 null이거나 현재 라운드에 해당하는 이벤트가 없습니다.");
            throw new BaseException(EVENT_NOT_FOUND);
        }

        Long eventId = (long) economicEvent[currentRound];
        GameEvent gameEvent = gameEventRepository.findById(eventId)
                .orElseThrow(() -> new BaseException(EVENT_NOT_FOUND));

        // 현재 발생한(다음 라운드에 반영될) 경제 뉴스를 currentEvent로 설정

        System.out.println("======================발행할 때=====================");
        System.out.println("적용할 이벤트 : " + gameEvent.getTitle());
        System.out.println("=================================================");

        // 현재 발생한(다음 라운드에 반영될) 경제 뉴스를 currentEvent로 설정
        game.setCurrentEvent(gameEvent);

        // Arena 객체에 수정된 Game 객체를 다시 설정
        arena.setGame(game);

        // 수정된 Arena를 Redis에 저장
        gameRepository.saveArena(roomId, arena);

        // 저장 후 즉시 다시 조회하여 확인
        Arena savedArena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        GameEvent savedEvent = savedArena.getGame().getCurrentEvent();
        System.out.println("Saved currentEvent: " + (savedEvent != null ? savedEvent.getTitle() : "null"));

        return game.getCurrentEvent();
    }

    /**
     * 전 라운드의 경제 이벤트를 현 라운드에 적용 ( 금리 및 주가 변동 )
     *
     * @param roomId
     * @return appliedEvent
     * @throws BaseException
     */
    @Transactional
    @Override
    public Game applyEconomicEvent(String roomId) throws BaseException {
        Arena arena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();

        int currentRound = game.getRound();
        if (currentRound < 2 || currentRound > 10) {
            log.info("경제 이벤트 적용은 2라운드부터 10라운드까지 발생합니다.");
            throw new BaseException(INVALID_ROUND);
        }

        GameEvent currentEvent = game.getCurrentEvent();
        if (currentEvent == null) {
            log.warn("현재 이벤트가 null입니다.");
            throw new BaseException(EVENT_NOT_FOUND);
        }

        // 현재 상태 로깅
        logCurrentState(game);

        // 금리 변동 적용
        applyInterestRateChange(game, currentEvent);

        // 주가 변동 적용
        applyStockPriceChange(game, currentEvent);

        // 변경된 게임 상태를 Arena에 설정
        arena.setGame(game);

        // 변경사항 저장
        gameRepository.saveArena(roomId, arena);

        // 저장 후 상태 확인
        Arena savedArena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game savedGame = savedArena.getGame();

        // 최종 상태 로깅
        logFinalState(savedGame);

        return savedGame;
    }

    /**
     * 돈 주우면서 돈 배열 수정 및 개인판 수정
     *
     * @param roomId        게임방 키
     * @param userNickname  유저명
     * @param moneyPointKey 돈 있는 좌표
     * @return MoneyCollectionResponse
     * @throws BaseException 예외처리
     */
    @Override
    public MoneyCollectionResponse collectMoney(String roomId, String userNickname, String moneyPointKey) throws BaseException {
        Arena arena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();

        // 잘못된 moneyPoint 값 체크
        if (!MoneyState.MONEY_COORDINATES.containsKey(moneyPointKey)) {
            throw new BaseException(INVALID_MONEY_POINT);
        }

        List<MoneyPoint> moneyPoints = game.getMoneyPoints();

        MoneyPoint point = moneyPoints.stream()
                .filter(moneypoint -> moneypoint.getPointId().equals(moneyPointKey))
                .findFirst()
                .orElseThrow(() -> new BaseException(MONEY_POINT_NOT_FOUND));

        if (point.getMoneyStatus() == 0) {
            throw new BaseException(MONEY_ALREADY_COLLECTED);
        }

        // 돈 줍기
        Player player = findPlayer(arena, userNickname);
        int addedMoney = (point.getMoneyStatus() == 2) ? 5 : 1; //TODO 비싼 돈은 5, 싼 돈은 1
        player.addCash(addedMoney);

        point.setMoneyStatus(0);

        try {
            // Arena 저장
            gameRepository.saveGameToRedis(game);
        } catch (Exception e) {
            log.error("레디스 저장 실패.", e);
            throw new BaseException(GAME_SAVE_FAILED);
        }

        // 돈 줍기 성공 응답 전송
        StompPayload<Integer> response = null;
        response = new StompPayload<>("SUCCESS_MONEY_PICKUP", roomId, userNickname, addedMoney);
        try {
            messagingTemplate.convertAndSend("/sub/" + roomId + "/game", response);
        } catch (MessagingException e) {
            log.error("돈 줍기 메시지 전송에 실패했습니다.", e);
        }

        return MoneyCollectionResponse.builder()
                .moneyPoints(moneyPoints)
                .build();
    }

    private void logCurrentState(Game game) {
        log.info("====================================");
        log.info("=========뉴스로 인한 변동값 보기==========");
        log.info("원래 금리 : " + game.getCurrentInterestRate());
        List<Integer> prices = Arrays.stream(game.getMarketStocks())
                .map(stockInfo -> {
                    int[] state = stockInfo.getState();
                    return stockState.getStockStandard()[state[0]][state[1]].getPrice();
                })
                .collect(Collectors.toList());
        log.info("원래 주가 : " + prices);
    }

    // 금리 변동
    private void applyInterestRateChange(Game game, GameEvent currentEvent) {
        int currentInterestRate = game.getCurrentInterestRate();
        currentInterestRate += currentEvent.getValue();
        if (currentInterestRate < 1) {
            currentInterestRate = 1;
        } else if (currentInterestRate > 10) {
            currentInterestRate = 10;
        }
        game.setCurrentInterestRate(currentInterestRate);
        log.info("바뀐 금리 : " + game.getCurrentInterestRate());
    }

    // 주가 변동
    private void applyStockPriceChange(Game game, GameEvent currentEvent) throws BaseException {
        StockInfo[] marketStocks = Arrays.stream(game.getMarketStocks())
                .map(si -> new StockInfo(si.getCnt(), Arrays.copyOf(si.getState(), 2)))
                .toArray(StockInfo[]::new);
        String affectedStockGroup = currentEvent.getAffectedStockGroup();
        int eventValue = currentEvent.getValue();

        switch (affectedStockGroup) {
            case "ALL":
                for (int i = 1; i < marketStocks.length; i++) {
                    modifyStockPrice(marketStocks[i], eventValue);
                }
                break;
            case "FOOD":
                for (int i = 1; i <= 2; i++) {
                    modifyStockPrice(marketStocks[i], eventValue);
                }
                break;
            case "GIFT":
                modifyStockPrice(marketStocks[3], eventValue);
                break;
            case "CLOTHES":
                for (int i = 4; i <= 5; i++) {
                    modifyStockPrice(marketStocks[i], eventValue);
                }
                break;
            case "NULL":
                break;
            default:
                throw new BaseException(INVALID_STOCK_GROUP);
        }

        game.setMarketStocks(marketStocks);
        List<Integer> newPrices = Arrays.stream(game.getMarketStocks())
                .map(stockInfo -> {
                    int[] state = stockInfo.getState();
                    return stockState.getStockStandard()[state[0]][state[1]].getPrice();
                })
                .collect(Collectors.toList());
        log.info("바뀐 주가 : " + newPrices);
    }

    // 저장 확인용 금리/주가 상태
    private void logFinalState(Game game) {
        log.info("금리 저장됐나요: " + game.getCurrentInterestRate());
        List<Integer> finalPrices = Arrays.stream(game.getMarketStocks())
                .map(stockInfo -> {
                    int[] state = stockInfo.getState();
                    return stockState.getStockStandard()[state[0]][state[1]].getPrice();
                })
                .collect(Collectors.toList());
        log.info("최종 주가 : " + finalPrices);
    }

    private void modifyStockPrice(StockInfo stockInfo, int eventValue) throws BaseException {
        if (eventValue > 0) {
            stockInfo.increaseState();
        } else if (eventValue < 0) {
            stockInfo.decreaseState();
        }
    }

    private int[] putRandomStockIntoMarket(int[] pocket, StockInfo[] market) throws BaseException {
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
        Set<Integer> selectedEconomicEvents = new HashSet<>();
        int[] result = new int[11];

        //시연용
        // 첫 번째와 두 번째 이벤트를 고정, 나머지 이벤트는 랜덤으로 생성
        result[1] = 18;
        result[2] = 4;
        selectedEconomicEvents.add(18);
        selectedEconomicEvents.add(4);

        for (int i = 3; i < result.length - 1; i++) {
            int eventIdx;
            int attempts = 0;
            do {
                eventIdx = random.nextInt(22) + 1;
                if (attempts > 50) {
                    throw new BaseException(EVENT_NOT_FOUND);
                }
                attempts++;
            } while (selectedEconomicEvents.contains(eventIdx));
            result[i] = eventIdx;
            selectedEconomicEvents.add(eventIdx);
        }
        return result;
    }

    /**
     * 매입한 금괴 개수를 플레이어 자산 및 금괴 매입 트랙( + 추가개수)에 반영
     * 플레이어별 개인 정보는 계속 브로드캐스팅 되기 때문에 redis 데이터 값만 바꿔주면됨
     *
     * @param goldBuyCount
     * @throws BaseException
     */
    @Override
    public void purchaseGold(String roomId, String userNickname, int goldBuyCount) throws BaseException, MessageException {
        Arena arena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();
        Player player = findPlayer(arena, userNickname);

        // 금괴 매입 비용 계산
        int currentGoldPrice = game.getGoldPrice();
        int totalCost = currentGoldPrice * goldBuyCount;

        if (player.getState() == COMPLETED) {
            log.debug("이미 금괴 매입을 완료한 플레이어입니다!");
            throw new BaseException(PLAYER_STATE_ERROR);
        }

        if (player.getCash() < totalCost) {
            throw new MessageException(roomId, userNickname, OUT_OF_CASH);
        }

        // 금괴 매입 표 변경 ( 시장에서 넣을 수 있는 랜덤 주식 넣기 )
        int[] currentMarketStocks = Arrays.stream(game.getMarketStocks())
                .mapToInt(StockInfo::getCnt)
                .toArray();
        System.out.println("현재 시장 주식들 : " + Arrays.toString(currentMarketStocks));

        List<Integer> selectableStocks = IntStream.range(1, currentMarketStocks.length)
                .filter(i -> currentMarketStocks[i] != 0)
                .boxed()
                .collect(Collectors.toList());
        System.out.println("뽑을 수 있는 0이 아닌 주식 : " + selectableStocks);

        int[] goldBuyTrack = game.getGoldBuyTrack();
        System.out.println("금괴 매수 트랙 : " + Arrays.toString(goldBuyTrack));

        int selectedStock = -1;
        for (int i = 1; i < goldBuyTrack.length; i++) {
            if (goldBuyTrack[i] == 0) {
                int randomIdx = selectableStocks.get(random.nextInt(selectableStocks.size()));
                selectedStock = randomIdx;
                System.out.println("랜덤으로 선택된 주식 종류 : " + randomIdx);
                goldBuyTrack[i] = randomIdx;
                // 선택 주식을 시장에서 제거
                currentMarketStocks[randomIdx]--;
                break;
            }
        }
        game.setGoldBuyTrack(goldBuyTrack);
        System.out.println("==========                     changed                   =========");
        System.out.println("금괴 매수 트랙 : " + Arrays.toString(goldBuyTrack));
        System.out.println("변경된 시장 주식들 : " + Arrays.toString(currentMarketStocks));

        // 시장에 반영
        StockInfo[] updatedMarketStocks = game.getMarketStocks();
        for (int i = 0; i < currentMarketStocks.length; i++) {
            updatedMarketStocks[i].setCnt(currentMarketStocks[i] + goldBuyTrack[i]);
        }
        game.setMarketStocks(updatedMarketStocks);

        // 금괴 추가 매입 수치 변경
        int currentGoldPriceIncreaseCnt = game.getGoldPriceIncreaseCnt();
        game.setGoldPriceIncreaseCnt(currentGoldPriceIncreaseCnt + goldBuyCount);

        // 자산에 금괴 개수 반영 및 금액 지불
        int currentMyCash = player.getCash();
        int currentMyGold = player.getGoldOwned();

        player.setCash(currentMyCash - currentGoldPrice * goldBuyCount);
        player.setGoldOwned(currentMyGold + goldBuyCount);
        player.setState(PlayerStatus.COMPLETED);
        player.setCarryingGolds(goldBuyCount);

        // 변경된 정보를 반영
        List<Player> players = game.getPlayers();
        for (int i = 0; i < players.size(); i++) {
            if (players.get(i).getNickname().equals(userNickname)) {
                players.set(i, player);
                break;
            }
        }
        game.setPlayers(players);

        // 금괴 매입 트랙에 의한 주가 상승 체크 및 반영
        // 1. 넣은 주식과 같은 종류의 주식이 딱 3개
        // 2. 뽑은 주식이 시장에서 해당 종류 마지막 토큰인 경우

        if (isStockNumThree(goldBuyTrack, selectedStock) || isStockMarketEmpty(currentMarketStocks, selectedStock)) {
            updatedMarketStocks[selectedStock].increaseState();
            System.out.println("주가상승!");
        }

        // 금괴 매입 트랙에 의한 주가 변동 체크 및 반영 - 꽉 찼을 때
        if (isStockFluctuationAble(goldBuyTrack)) {
            game.setGoldBuyTrack(new int[]{0, 0, 0, 0, 0, 0});
            game.setRoundStatus(STOCK_FLUCTUATION); // TODO 주가변동 메서드 스케줄러에 넣기
            System.out.println("주가변동!!");
        }

        arena.setGame(game);
        gameRepository.saveArena(roomId, arena);
        System.out.println("==================================================================");
    }

    private boolean isStockNumThree(int[] goldBuyTrack, int selectedStock) {
        int checkStockCnt = 0;
        for (int i = 1; i < goldBuyTrack.length; i++) {
            if (goldBuyTrack[i] == selectedStock) {
                checkStockCnt++;
            }
        }
        return checkStockCnt == 3;
    }

    private boolean isStockMarketEmpty(int[] currentMarketStocks, int selectedStock) {
        return currentMarketStocks[selectedStock] == 0;
    }

    private boolean isStockFluctuationAble(int[] goldBuyTrack) {
        for (int i = 1; i < goldBuyTrack.length; i++) {
            if (goldBuyTrack[i] == 0) {
                return false;
            }
        }
        return true;
    }


    /**
     * 주가 변동 가능 여부 체크 ( 주가 매수 트랙, 주가 매도 트랙, 금괴 매입 트랙) -> 주가 변동 로직 실행
     *
     * @param roomId
     * @return
     * @throws BaseException
     */
    @Override
    public boolean isStockFluctuationAble(String roomId) throws BaseException {
        return false;
    }

    // 대출
    @Override
    public int calculateLoanLimit(String roomId, String sender) throws BaseException, MessageException {

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Player player = findPlayer(arena, sender);

        Game game = arena.getGame();

        // 1. 현금 자산 대비 DSR 목표 금액 계산
        double desiredDsr = isRichestPlayer(game, player) ? 0.4 : 0.3; // 가장 부유한 플레이어는 DesiredDSR가 40%, 그 외 30%
        int maxLoanPayment = (int) ((player.getCash() - player.getTotalDebt()) * desiredDsr);

        // 2. 기존 부채 상환액 차감
        // 2-1. 기존 부채 상환액 계산
        int existingDebt = 0;
        int leftRoundCnt = 10 - game.getRound();
        for (LoanProduct loanProduct : player.getLoanProducts()) {
            int loanPrincipal = loanProduct.getLoanPrincipal();
            double interestRate = loanProduct.getInterestRate() / 100.0;
            int loanInterest = loanProduct.getLoanInterest();
            existingDebt +=
                    (int) (((loanPrincipal * interestRate * Math.pow(1 + interestRate, leftRoundCnt))
                            / (Math.pow(1 + interestRate, leftRoundCnt) - 1)) + loanInterest / leftRoundCnt);
        }

        // 2-2. DSR 목표 금액에서 기존 부채 상환액 차감
        int availableRepaymentCapacity = maxLoanPayment - existingDebt;

        if (availableRepaymentCapacity < 0) {
            return 0;
        }

        // 3. 대출 한도 산정
        double marketInterestRate = game.getCurrentInterestRate() / 100.0 * 4;
        int loanLimit = (int) (((game.getCurrentStockPriceLevel() + 1) * availableRepaymentCapacity / 10.0 * 7) / marketInterestRate);

        // 4. 금괴, 주식 가치 대출 한도에 반영
        loanLimit += (int) (player.getGoldOwned() * game.getGoldPrice() * 0.7);
        loanLimit += (int) (getStockValue(player.getStock(), game.getMarketStocks()) * 0.4);

        loanLimit = Math.min(loanLimit, 1000);

        return loanLimit;
    }

    private boolean isRichestPlayer(Game game, Player player) {
        int totalValue;
        int maxValue = 0;
        Player richestPlayer = null;
        int goldPrice = game.getGoldPrice();
        StockInfo[] marketStocks = game.getMarketStocks();

        for (Player inGamePlayer : game.getPlayers()) {
            // 현금 자산
            totalValue = inGamePlayer.getCash();

            // 금괴 가치
            totalValue += inGamePlayer.getGoldOwned() * goldPrice;

            // 주식 가치
            totalValue += getStockValue(inGamePlayer.getStock(), marketStocks);

            if (totalValue > maxValue || (totalValue == maxValue && inGamePlayer == player)) {
                maxValue = totalValue;
                richestPlayer = inGamePlayer;
            }
        }

        return richestPlayer == player;
    }

    private int getStockValue(int[] stocks, StockInfo[] marketStocks) {
        int stockValue = 0;
        for (int i = 1; i < 6; i++) {
            stockValue += getStockPrice(marketStocks, i) * stocks[i];
        }
        return stockValue;
    }

    public int getStockPrice(StockInfo[] marketStocks, int index) {
        StockInfo stockInfo = marketStocks[index];
        return stockState.getStockStandard()[stockInfo.getState()[0]][stockInfo.getState()[1]].getPrice();
    }

    /**
     * [takeLoan] 대출 후 자산반영, 메세지 전송
     *
     * @param roomId
     * @param sender
     * @throws BaseException 요청 금액이 대출 한도를 넘어가는 경우
     */
    @Override
    public void takeLoan(String roomId, String sender, int amount) throws BaseException, MessageException {

        validateRequest(roomId, sender);
        int range = calculateLoanLimit(roomId, sender);

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Game game = arena.getGame();
        Player player = findPlayer(arena, sender);

        // 요청 금액이 대출 한도를 이내인지 검사
        if (amount <= 0 || range < amount) {
            throw new MessageException(roomId, sender, AMOUNT_OUT_OF_RANGE);
        }

        player.getLoanProducts().add(new LoanProduct(game.getCurrentInterestRate(), amount, 0, game.getRound(), 120 - game.getTime()));
        player.setTotalDebt(player.getTotalDebt() + amount);
        player.setCash(player.getCash() + amount);

        gameRepository.saveArena(roomId, arena);
    }

    // 상환

    /**
     * [repayLoan] 상환 후 자산 반영, 메세지 전송
     *
     * @throws BaseException 상환 금액이 유효하지 않은 값일 때
     */
    @Override
    public void repayLoan(String roomId, String sender, int amount) throws BaseException, MessageException {

        validateRequest(roomId, sender);

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        Player player = findPlayer(arena, sender);

        // 상환액이 총 부채보다 많을 경우, MessageException 발생
        TreeSet<LoanProduct> loanProducts = player.getLoanProducts();
        int totalDebt = player.getTotalDebt();

        // 상환액이 총 부채금보다 많을 경우 MessageException 발생
        if (totalDebt < amount || amount <= 0) {
            throw new MessageException(roomId, sender, AMOUNT_EXCEED_DEBT);
        }

        // 상환액이 내 현금자산 보다 많을 경우 MessageException 발생
        if (amount > player.getCash()) {
            throw new MessageException(roomId, sender, AMOUNT_EXCEED_CASH);
        }

        // 내 현금 자산에서 amount 빼기
        player.setCash(player.getCash() - amount);

        // totalDebt에서 amount 빼기
        player.setTotalDebt(totalDebt - amount);

        // LoanProducts 돌면서 '이자 -> 대출원금' 상환
        Iterator<LoanProduct> iterator = loanProducts.iterator();
        while (iterator.hasNext()) {
            LoanProduct loanProduct = iterator.next();

            // 이자 상환
            if (loanProduct.getLoanInterest() <= amount) {
                amount -= loanProduct.getLoanInterest();
                loanProduct.setLoanInterest(0);
            } else {
                loanProduct.setLoanInterest(loanProduct.getLoanInterest() - amount);
                break;
            }

            // 대출 원금 상환
            if (loanProduct.getLoanPrincipal() <= amount) {
                amount -= loanProduct.getLoanPrincipal();
                iterator.remove();
            } else {
                loanProduct.setLoanPrincipal(loanProduct.getLoanPrincipal() - amount);
                break;
            }

            if (amount == 0) {
                break;
            }
        }

        gameRepository.saveArena(roomId, arena);
    }

    @Override
    public void addInterestToTotalDebtAndLoanProducts(Game game) {
        List<Player> players = game.getPlayers();

        for (Player player : players) {
            int totalInterest = 0;
            for (LoanProduct loanProduct : player.getLoanProducts()) {
                int interest = (int) (loanProduct.getLoanPrincipal() * loanProduct.getInterestRate() / 100.0);
                totalInterest += interest;
                loanProduct.setLoanInterest(loanProduct.getLoanInterest() + interest);
            }
            player.setTotalDebt(player.getTotalDebt() + totalInterest);
        }
    }

    @Override
    public void setStocksOnCarryingStocks(String roomId, String sender, int[] stocksToCarry) throws BaseException, MessageException {

        validateRequest(roomId, sender);
        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        Player player = findPlayer(arena, sender);
        int[] ownedStocks = player.getStock();

        for (int i = 1; i < 6; i++) {
            if (ownedStocks[i] < stocksToCarry[i]) {
                throw new MessageException(roomId, sender, INVALID_STOCK_COUNT);
            }
        }
        player.setCarryingStocks(stocksToCarry);

        gameRepository.saveArena(roomId, arena);
    }

    // 주식 매도
    @Override
    public void sellStock(String roomId, String sender, int[] stocksToSell) throws BaseException {

        validateRequest(roomId, sender);
        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        Game game = arena.getGame();
        int currentStockPriceLevel = game.getCurrentStockPriceLevel();
        StockInfo[] marketStocks = game.getMarketStocks();
        int[] stockSellTrack = game.getStockSellTrack();
        Player player = findPlayer(arena, sender);
        int[] carryingStocks = player.getCarryingStocks();
        int[] ownedStocks = player.getStock();

//        if (player.getState() == COMPLETED) {
//            throw new BaseException(PLAYER_STATE_ERROR);
//        }

        // 1. stocks 유효성 검사 (각 숫자가 0 이상/합산한 개수가 0 초과 주가 수준 거래 가능 토큰 개수 이하)
        validateStocks(stocksToSell, currentStockPriceLevel);

        // stocksToSell이 내가 보유한 주식의 개수보다 작은지 판별
        for (int i = 1; i < 6; i++) {
            if (stocksToSell[i] > ownedStocks[i]) {
                throw new BaseException(INVALID_SELL_STOCKS);
            }
        }

        // 2. 주식 매도 가격 계산
        int salePrice = 0;  // 주식 매도 대금
        int stockPrice;
        for (int i = 1; i < 6; i++) {
            stockPrice = getStockPrice(marketStocks, i);
            salePrice += stockPrice * stocksToSell[i];
            carryingStocks[i] -= stocksToSell[i];
            ownedStocks[i] -= stocksToSell[i];
            marketStocks[i].addCnt(stocksToSell[i]);
        }

        // 3. 개인 현금에 매도 가격 적용하고 거래 행위 완료로 변경
        player.addCash(salePrice);
//        player.setState(PlayerStatus.COMPLETED);

        // 4. 매도 트랙에서 주식시장으로 토큰 옮기고 주가 하락
        moveStockFromSellTrackAndCheckDecrease(marketStocks, stockSellTrack);

        // 5. 남은 주식토큰이 5개면 주가 변동 -> 주식 매도트랙 세팅
        int leftStocks = 0;
        for (int i = 1; i < 6; i++) {
            leftStocks += stockSellTrack[i];
        }
        if (leftStocks == 5) {
            game.setRoundStatus(STOCK_FLUCTUATION);

            // 6. 매도트랙 세팅
            for (int i = 1; i < 6; i++) {
                game.getStockTokensPocket()[i] += stockSellTrack[i];
            }
            game.setStockSellTrack(new int[]{2, 2, 2, 2, 2, 2});
        }

        gameRepository.saveArena(roomId, arena);
    }

    /**
     * 매도트랙에서 주식시장으로 주식 토큰 하나 옮기고 주가 하락 (주식시장으로 옮길 토큰이 없을 시 수행하지 않음)
     *
     * @param marketStocks
     * @param stockSellTrack
     * @throws BaseException : 하락한 주가의 좌표가 유효하지 않은 주가 기준표의 좌표일 경우
     */
    public void moveStockFromSellTrackAndCheckDecrease(StockInfo[] marketStocks, int[] stockSellTrack) throws BaseException {
        List<Integer> availableStocks = new ArrayList<>(5);
        for (int i = 1; i < 6; i++) {
            if (stockSellTrack[i] > 0) {
                availableStocks.add(i);
            }
        }

        if (!availableStocks.isEmpty()) {
            int randomStockIndex = availableStocks.get(random.nextInt(availableStocks.size()));
            System.out.println("!!!!!!!!randomIndex!!!!!!!! : " + randomStockIndex);
            stockSellTrack[randomStockIndex] -= 1;
            marketStocks[randomStockIndex].addCnt(1);
            marketStocks[randomStockIndex].decreaseState();
        }
    }

    // 주가 변동
    public void changeStockPrice(Game game) throws BaseException {
        int stockPriceLevel = game.getCurrentStockPriceLevel();

        int[] stockTokensPocket = game.getStockTokensPocket();

        // 1. 현재 주가 수준에 해당하는 주식 토큰의 개수를 뽑기
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

            // 3-2. 뽑은 주식 토큰 中, 각 색깔의 주가 토큰 개수가 표시된 위치로 이동(*주가 조정 참조표* 참고)
            for (int i = 1; i < 6; i++) {

                int stockCntDiff = selectedStockCnts[i] - selectedStockCnts[0];

                if (stockCntDiff < -6) {
                    throw new BaseException(INVALID_BLACK_TOKEN);
                } else if (stockCntDiff < 0) {
                    marketStocks[i].setStockPriceInRange(stockCntDiff + 13);
                } else if (stockCntDiff < 7) {
                    marketStocks[i].setStockPriceInRange(stockCntDiff);
                }
                // 토큰 개수이 차이가 6을 초과했다면(최대 12 가능)
                else if (stockCntDiff <= 12) {
                    marketStocks[i].setStockPriceInRange(6);
                    marketStocks[i].ascendAndDescendState(-(stockCntDiff - 6));
                } else {
                    throw new BaseException(EXCEEDS_DIFF_RANGE);
                }

                // 4. 주식 토큰 정리: 주머니에서 뽑은 색깔 주식 토큰을 일치하는 색깔의 주식시장에 놓기
                marketStocks[i].addCnt(selectedStockCnts[i]);

                // 5. 주가 상승: 여전히 주식 시장에 주식 토큰이 없는 색깔은 주가를 위쪽으로 한 칸 이동
                if (marketStocks[i].getCnt() == 0) marketStocks[i].ascendAndDescendState(-1);

                // 6. 주가 수준 변동 조건 확인 후, 필요 시 주가 수준 변동
                int newLevel = stockState.getStockStandard()[marketStocks[i].getState()[0]][marketStocks[i].getState()[1]].getLevel();

                // 새로운 주가수준이 상위영역에 처음 진입했는지
                if (stockPriceLevel < newLevel) {
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
    public void movePlayer(StompPayload<PlayerMoveRequest> payload) throws BaseException {
        String roomId = payload.getRoomId();

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        synchronized (arena) {
            Player player = findPlayer(arena, payload.getSender());
            PlayerMoveRequest playerMoveRequest = payload.getData();

            player.setDirection(playerMoveRequest.direction());
            player.setPosition(playerMoveRequest.position());
            player.setActionToggle(playerMoveRequest.actionToggle());
            player.setTrading(playerMoveRequest.isTrading());
            player.setCarrying(playerMoveRequest.isCarrying());
            player.setAnimation(playerMoveRequest.animation());

            for (Player otherPlayer : arena.getGame().getPlayers()) {
                if (!otherPlayer.getNickname().equals(player.getNickname())) {
                    double distance = player.distanceTo(otherPlayer);
                    boolean isClose = distance <= 5;
                    notifyPlayerDistance(roomId, player, otherPlayer, isClose);
                }
            }
            gameRepository.saveArena(roomId, arena);
        }
    }

    private void notifyPlayerDistance(String roomId, Player p1, Player p2, boolean isClose) {
        String message = p1.getNickname() + ":" + p2.getNickname();
        StompPayload<PlayerDistanceDto> payload = new StompPayload<>(
                isClose ? "BATTLE_AVAILABLE" : "BATTLE_UNAVAILABLE",
                roomId,
                null,
                new PlayerDistanceDto(message, isClose)
        );
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", payload);
    }


    @Override
    public void buyStock(StompPayload<StockRequest> payload) throws BaseException, MessageException {
        String roomId = payload.getRoomId();
        String playerNickname = payload.getSender();
        int[] stocksToBuy = payload.getData().stocks();

        Arena arena = gameRepository.findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        synchronized (arena) {
            Player player = findPlayer(arena, playerNickname);
            Game game = arena.getGame();

//            if (player.getState() == COMPLETED) {
//                throw new BaseException(PLAYER_STATE_ERROR);
//            }

            int stockPriceLevel = game.getCurrentStockPriceLevel();
            StockInfo[] marketStocks = game.getMarketStocks();
            int[] stockBuyTrack = game.getStockBuyTrack();

            int totalCost = calculateTotalCost(stocksToBuy, marketStocks);

            validateStocks(stocksToBuy, stockPriceLevel);
            validateStockAvailability(stocksToBuy, marketStocks, roomId, playerNickname);

            if (player.getCash() < totalCost) {
                throw new MessageException(roomId, playerNickname, INSUFFICIENT_CASH);
            }
            player.setCash(player.getCash() - totalCost);
//            player.setState(PlayerStatus.COMPLETED);

            updatePlayerStocks(stocksToBuy, player);
            updateStockMarket(stocksToBuy, marketStocks);

            boolean hasStockPriceIncreased = updateSellTrackAndCheckIncrease(marketStocks, stockBuyTrack);

            if (!hasStockPriceIncreased) {
                checkAndApplyStockPriceIncrease(stockBuyTrack, marketStocks);
            }

            checkAndApplyStockPriceChange(stockBuyTrack, game, stockPriceLevel);

            gameRepository.saveArena(roomId, arena);
        }
    }

    private int calculateTotalCost(int[] stocksToBuy, StockInfo[] marketStocks) {
        int totalCost = 0;
        for (int i = 1; i < 6; i++) {
            if (stocksToBuy[i] > 0) {
                int[] priceLocation = marketStocks[i].getState();
                int price = stockState.getStockStandard()[priceLocation[0]][priceLocation[1]].getPrice();
                totalCost += price * stocksToBuy[i];
            }
        }
        return totalCost;
    }

    private void validateStockAvailability(int[] stocksToBuy, StockInfo[] marketStocks, String roomId, String playerNickname) throws MessageException {
        for (int i = 1; i < 6; i++) {
            if (stocksToBuy[i] > 0 && marketStocks[i].getCnt() < stocksToBuy[i]) {
                throw new MessageException(roomId, playerNickname, STOCK_NOT_AVAILABLE);
            }
        }
    }

    private void updatePlayerStocks(int[] stocksToBuy, Player player) {
        for (int i = 1; i < 6; i++) {
            if (stocksToBuy[i] > 0) {
                player.getCarryingStocks()[i] += stocksToBuy[i];
                player.getStock()[i] += stocksToBuy[i];
            }
        }
    }

    private void updateStockMarket(int[] stocksToBuy, StockInfo[] marketStocks) {
        for (int i = 1; i < 6; i++) {
            if (stocksToBuy[i] > 0) {
                marketStocks[i].setCnt(marketStocks[i].getCnt() - stocksToBuy[i]);
            }
        }
    }

    private boolean updateSellTrackAndCheckIncrease(StockInfo[] marketStocks, int[] stockBuyTrack) throws BaseException {
        List<Integer> availableStocks = new ArrayList<>(5);
        for (int i = 1; i < 6; i++) {
            if (marketStocks[i].getCnt() > 0) {
                availableStocks.add(i);
            }
        }

        if (!availableStocks.isEmpty()) {
            int randomStockIndex = availableStocks.get(random.nextInt(availableStocks.size()));
            stockBuyTrack[randomStockIndex]++;

            marketStocks[randomStockIndex].setCnt(marketStocks[randomStockIndex].getCnt() - 1);
            if (marketStocks[randomStockIndex].getCnt() == 0) {
                marketStocks[randomStockIndex].increaseState();
                return true;
            }
        }
        return false;
    }

    private void checkAndApplyStockPriceChange(int[] stockBuyTrack, Game game, int stockPriceLevel) throws BaseException {
        int totalStockInTrack = 0;
        for (int count : stockBuyTrack) {
            totalStockInTrack += count;
        }

        if (totalStockInTrack == 5) {
            changeStockPrice(game);
        }
    }

    private void checkAndApplyStockPriceIncrease(int[] stockBuyTrack, StockInfo[] marketStocks) throws BaseException {
        for (int i = 1; i < 6; i++) {
            if (stockBuyTrack[i] == 3) {
                marketStocks[i].increaseState();
                break;
            }
        }
    }

    @Override
    public void setStockPriceChangeInfo(Game game, int round, int remainTime) {

        int x_value = ((round - 1) * 120 + (120 - remainTime)) / 20;

        StockInfo[] marketStocks = game.getMarketStocks();
        for (int i = 1; i < 6; i++) {
            int r = marketStocks[i].getState()[0];
            int c = marketStocks[i].getState()[1];
            game.getStockPriceChangeInfo()[i][x_value] = stockState.getStockStandard()[r][c].getPrice();
        }
    }

    @Override
    public void setGoldPriceChartInfo(Game game, int round, int remainTime) throws BaseException {
        int idx = (round - 1) * 6 + (120 - remainTime) / 20;
        int[] goldPriceChart = game.getGoldPriceChart();
        game.getGoldPriceChart()[idx] = game.getGoldPrice();
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
     * @param stocksToSell    : 플레이어가 파려고 하는 주식들
     * @param stockPriceLevel : 주가 수준
     * @throws BaseException : 아래 두 조건을 만족하지 않는 경우
     *                       - 각 숫자가 0 미만인 동시에 거래 주식 개수가 0 초과 거래가능토큰개수(주가수준 기준) 이하
     *                       - 주식 종류별 내가 보유한 주식 개수 이하
     */
    private void validateStocks(int[] stocksToSell, int stockPriceLevel) throws BaseException {
        // 각 숫자가 0 이상 && 합산한 개수가 0 초과 주가 수준 거래 가능 토큰 개수 이하
        int stockCnt = 0;
        for (int i = 1; i < 6; i++) {
            if (stocksToSell[i] < 0) {
                throw new BaseException(INVALID_SELL_STOCKS);
            }
            stockCnt += stocksToSell[i];
        }

        if (stockCnt > stockState.getStockLevelCards()[stockPriceLevel][0] || stockCnt <= 0) {
            throw new BaseException(IMPOSSIBLE_STOCK_CNT);
        }
    }
}
