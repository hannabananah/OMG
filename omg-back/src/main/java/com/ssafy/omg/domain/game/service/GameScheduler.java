package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.*;
import com.ssafy.omg.domain.game.entity.*;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.*;
import static com.ssafy.omg.domain.game.entity.RoundStatus.*;

@Slf4j
@Component
@RequiredArgsConstructor
@Transactional
public class GameScheduler {

    @Autowired
    private RedisTemplate<String, Arena> redisTemplate;

    @Autowired
    private ApplicationContext applicationContext;

    private final GameService gameService;
    private final GameRepository gameRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    private static final int MAX_ROUNDS = 10;

    private final StockState stockState;

    @Scheduled(fixedRate = 1000)  // 1초마다 실행
    public void updateGameState() throws BaseException {
        try {
            List<Game> activeGames = gameService.getAllActiveGames();
            for (Game game : activeGames) {
                updateRoundStatus(game);
                gameRepository.saveGameToRedis(game);
//                gameService.saveGame(game);
            }
        } catch (BaseException e) {
            log.info("라운드 진행 상태 업데이트 중 오류가 발생하였습니다.");
            throw new BaseException(ROUND_STATUS_ERROR);
        }
    }

    /**
     * 시스템 상에서 자동적으로 라운드 진행 및 라운드 상태 변경
     *
     * @param game game 정보
     * @throws BaseException
     */
    private void updateRoundStatus(Game game) throws BaseException {

        if (game.isGameFinished()) {
            return;
        }

        switch (game.getRoundStatus()) {
            case TUTORIAL:
                handleTutorial(game);
                break;
            case ROUND_START:
                handleRoundStart(game);
                break;
            case APPLY_PREVIOUS_EVENT:
                handleApplyPreviousEvent(game);
                break;
            case ECONOMIC_EVENT_NEWS:
                handleEconomicEvent(game);
                break;
            case ROUND_IN_PROGRESS:
                handleRoundInProgress(game);
                break;
            case STOCK_FLUCTUATION:
                handleStockFluctuation(game);
                break;
            case ROUND_END:
                handleRoundEnd(game);
                break;
            case PREPARING_NEXT_ROUND:
                handlePreparingNextRound(game);
                break;
            case GAME_FINISHED:
                handleGameFinish(game);
                break;
            default:
                throw new BaseException(INVALID_ROUND_STATUS);
        }
        if (game.getRoundStatus() != STOCK_FLUCTUATION) {
            decreaseTime(game);
        } else {
            decreasePauseTime(game);
        }
    }

    private void decreaseTime(Game game) {
        if (!game.isPaused() && game.getTime() > 0) {
            game.setTime(game.getTime() - 1);
        }
        log.debug("게임 {}의 현재 시간 : {}초", game.getGameId(), game.getTime());
    }

    private void decreasePauseTime(Game game) {
        if (game.isPaused() && game.getPauseTime() > 0) {
            game.setPauseTime(game.getPauseTime() - 1);
        }
        log.debug("게임 {}의 현재 시간 : {}초", game.getGameId(), game.getTime());
    }

    private void handleTutorial(Game game) {
        if (game.getTime() == 0) {
            game.setRoundStatus(ROUND_START);
            game.setTime(3);
            log.debug("상태를 ROUND_START로 변경. 새 시간: {}", game.getTime());
        }
    }

    private void handleRoundStart(Game game) throws BaseException {
        if (game.getTime() == 2) {
//            notifyPlayers(game.getGameId(), ROUND_START, +game.getRound() + "라운드가 시작됩니다!");
            notifyRoundStart(game.getGameId(), ROUND_START, game.getRound() + "라운드가 시작됩니다!", game.getRound());
            notifyPlayersRankingMessage(game);

            // 주울 돈 초기화
            MoneyState moneyState = new MoneyState();
            moneyState.initializeMoneyPoints();
            game.setMoneyPoints(moneyState.getMoneyPoints());

            gameRepository.saveGameToRedis(game);

            // 바뀐 개인 판 및 돈 정보 전송
            notifyMoneyPoints(game.getGameId(), game.getMoneyPoints());
        } else if (game.getTime() == 0) {
            game.setRoundStatus(APPLY_PREVIOUS_EVENT);
            game.setTime(5);
            log.debug("상태를 APPLY_PREVIOUS_EVENT로 변경. 새 시간: {}", game.getTime());
        }
    }

    // 이전 라운드의 경제 이벤트 적용
    private void handleApplyPreviousEvent(Game game) throws BaseException {
        if (game.getTime() == 4) {
            try {
                GameEvent gameEvent = game.getCurrentEvent();
                if (gameEvent == null) {
                    log.warn("현재 이벤트가 null입니다. 이전 라운드에서 이벤트가 설정되지 않았을 수 있습니다.");
                    game.setRoundStatus(ECONOMIC_EVENT_NEWS);
                    game.setTime(5);
                    return;
                }

                log.debug("이전 라운드의 경제 이벤트가 현재 경제 시장에 반영됩니다!!");
                Game updatedGame = gameService.applyEconomicEvent(game.getGameId());

                // 업데이트된 게임 상태를 사용
                game.setCurrentInterestRate(updatedGame.getCurrentInterestRate());
                game.setMarketStocks(updatedGame.getMarketStocks());

                // 변경사항을 Redis에 저장
                gameRepository.saveGameToRedis(game);

                // 저장 후 즉시 Redis에서 다시 읽어와 확인
                Arena savedArena = gameRepository.findArenaByRoomId(game.getGameId())
                        .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
                Game savedGame = savedArena.getGame();

                log.debug("경제 이벤트가 반영됨!");
                log.debug("반영후 금리 : {}", savedGame.getCurrentInterestRate());
                log.debug("반영후 주가 : {}", Arrays.stream(savedGame.getMarketStocks())
                        .map(stockInfo -> {
                            int[] state = stockInfo.getState();
                            return stockState.getStockStandard()[state[0]][state[1]].getPrice();
                        })
                        .collect(Collectors.toList()));

                GameEventDto eventDto = new GameEventDto(
                        APPLY_PREVIOUS_EVENT,
                        gameEvent.getTitle(),
                        gameEvent.getContent(),
                        gameEvent.getValue()
                );

                StompPayload<GameEventDto> payload = new StompPayload<>(
                        "GAME_NOTIFICATION",
                        game.getGameId(),
                        "GAME_MANAGER",
                        eventDto
                );

                messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", payload);
                notifyMainMessage(game.getGameId(), "GAME_MANAGER");

                // 트랜잭션 체킹용 sout
                log.debug("경제 이벤트가 반영됨!");
                System.out.println();
                System.out.println("반영후 금리 : " + game.getCurrentInterestRate());
                System.out.println();
                List<Integer> prices = Arrays.stream(game.getMarketStocks())
                        .map(stockInfo -> {
                            int[] state = stockInfo.getState();
                            return stockState.getStockStandard()[state[0]][state[1]].getPrice();
                        })
                        .collect(Collectors.toList());
                System.out.println("반영후 주가 : " + prices);
                System.out.println();
//            notifyPlayers(game.getGameId(), APPLY_PREVIOUS_EVENT, "이전 라운드의 경제 이벤트가 적용되었습니다.");
            } catch (BaseException e) {
                log.warn("경제 이벤트 반영 중 에러 발생 : {}", e.getMessage());
                game.setRoundStatus(ECONOMIC_EVENT_NEWS);
                game.setTime(5);
            }
        } else if (game.getTime() == 0) {
            game.setRoundStatus(ECONOMIC_EVENT_NEWS);
            game.setTime(5);
        }
    }

    private void handleEconomicEvent(Game game) throws BaseException {
        if (game.getTime() == 4) {
            try {
                GameEvent gameEvent = gameService.createGameEventNews(game.getGameId());
                log.debug("새로운 경제 이벤트 발생: {}", gameEvent != null ? gameEvent.getTitle() : "null");
//                notifyPlayers(game.getGameId(), ECONOMIC_EVENT, "경제 이벤트가 발생했습니다!");

                if (gameEvent != null) {
                    applicationContext.publishEvent(gameEvent);

                    game.setCurrentEvent(gameEvent);

                    GameEventDto eventDto = new GameEventDto(
                            ECONOMIC_EVENT_NEWS,
                            gameEvent.getTitle(),
                            gameEvent.getContent(),
                            gameEvent.getValue()
                    );

                    StompPayload<GameEventDto> payload = new StompPayload<>(
                            "GAME_NOTIFICATION",
                            game.getGameId(),
                            "GAME_MANAGER",
                            eventDto
                    );

                    log.debug("경제 이벤트 발생! : {}", gameEvent.getTitle());
                    messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", payload);
                }
            } catch (BaseException e) {
                log.warn("경제 이벤트 생성 중 에러 발생: {}", e.getStatus().getMessage());
                if (game.getRound() == 10) {
                    game.setRoundStatus(ROUND_IN_PROGRESS);
                    game.setTime(120);
                    return;
                }
            }
        } else if (game.getTime() == 0) {
            game.setRoundStatus(ROUND_IN_PROGRESS);
            game.setTime(120);
            log.debug("상태를 ROUND_IN_PROGRESS로 변경. 새 시간: {}", game.getTime());
        }
    }

    private void handleRoundInProgress(Game game) throws BaseException {
        int currentTime = game.getTime();
        notifyPlayersTime(game.getGameId(), currentTime);
        if (currentTime == 30 || currentTime == 10) {
            notifyPlayers(game.getGameId(), ROUND_IN_PROGRESS, currentTime + " 초 남았습니다!");
        } else if (game.getTime() == 0) {
            game.setRoundStatus(ROUND_END);
            game.setTime(3);
            log.debug("상태를 ROUND_END로 변경. 새 시간: {}", game.getTime());
        } else if (game.getTime() == 119 || game.getTime() % 20 == 0) {
            updateAndBroadcastMarketInfo(game, "STOCK");
            updateAndBroadcastMarketInfo(game, "GOLD");
            notifyPlayersRankingMessage(game);

//            int remainTime = (game.getTime() == 119) ? 120 : game.getTime();
//            gameService.setStockPriceChangeInfo(game, game.getRound(), remainTime);
//            StockMarketResponse stockMarketResponseresponse = gameService.createStockMarketInfo(game);
//            GoldMarketInfoResponse goldMarketInfoResponse = gameService.createGoldMarketInfo(game);
//            StompPayload<StockMarketResponse> stockMarketResponseStompPayload = new StompPayload<>("STOCK_MARKET_INFO", game.getGameId(), "GAME_MANAGER", stockMarketResponseresponse);
//            StompPayload<GoldMarketInfoResponse> goldMarketResponseStompPayload = new StompPayload<>("GOLD_MARKET_INFO", game.getGameId(), "GAME_MANAGER", goldMarketInfoResponse);
//            messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", stockMarketResponseStompPayload);
//            messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", goldMarketResponseStompPayload);
        }
    }

    public void updateAndBroadcastMarketInfo(Game game, String marketType) throws BaseException {
        int remainingTime = (game.getTime() == 119) ? 120 : game.getTime();
        gameService.setStockPriceChangeInfo(game, game.getRound(), remainingTime);
        gameService.setGoldPriceChartInfo(game, game.getRound(), remainingTime);

        switch (marketType) {
            case "STOCK":
                broadcastMarketInfo(game, "STOCK_MARKET_INFO", gameService.createStockMarketInfo(game));
                break;

            case "GOLD":
                broadcastMarketInfo(game, "GOLD_MARKET_INFO", gameService.createGoldMarketInfo(game));
                break;

            default:
                throw new BaseException(INVALID_MARKET_INFO);
        }
//        broadcastMarketInfo(game, "STOCK_MARKET_INFO", gameService.createStockMarketInfo(game));
//        broadcastMarketInfo(game, "GOLD_MARKET_INFO", gameService.createGoldMarketInfo(game));
    }

    private <T> void broadcastMarketInfo(Game game, String type, T marketInfo) {
        StompPayload<T> payload = new StompPayload<>(type, game.getGameId(), "GAME_MANAGER", marketInfo);
        messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", payload);
    }

    private void handleStockFluctuation(Game game) throws BaseException {
        if (!game.isPaused()) {
            game.setPaused(true);
            game.setPauseTime(5);
            gameService.changeStockPrice(game);
            notifyPlayers(game.getGameId(), STOCK_FLUCTUATION, "주가가 변동되었습니다! 5초 후 게임이 재개됩니다.");

            // 거래 가능한 주식 개수 메세지로 전송
            StockFluctuationResponse response = new StockFluctuationResponse(stockState.getStockLevelCards()[game.getCurrentStockPriceLevel()][0]);
            StompPayload<StockFluctuationResponse> payload = new StompPayload<>("STOCK_FLUCTUATION", game.getGameId(), "GAME_MANAGER", response);
            messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", payload);

            notifyMainMessage(game.getGameId(), "GAME_MANAGER");
            notifyPlayersRankingMessage(game);
        } else {
//            if (game.getPauseTime() > 0) {
//                game.setPauseTime(game.getPauseTime() - 1);
//            }

            if (game.getPauseTime() == 0) {
                game.setPaused(false);
                game.setRoundStatus(RoundStatus.ROUND_IN_PROGRESS);
            }
        }

    }

    private void handleRoundEnd(Game game) throws BaseException {
        log.debug("handleRoundEnd 진입. 현재 시간: {}", game.getTime());

        if (game.getTime() == 2) {
            notifyPlayers(game.getGameId(), ROUND_END, game.getRound() + "라운드가 종료되었습니다! 대출상품에 대한 이자가 추가됩니다!");
            gameService.addInterestToTotalDebtAndLoanProducts(game);
            calculateTaxPerPlayer(game);
        } else if (game.getTime() == 0) {
            game.setRoundStatus(PREPARING_NEXT_ROUND);
            game.setTime(5);
            log.debug("상태를 PREPARING_NEXT_ROUND로 변경. 새 시간: {}", game.getTime());
        }
        log.debug("handleRoundEnd 종료. 최종 시간: {}, 상태: {}", game.getTime(), game.getRoundStatus());
    }

    private void handlePreparingNextRound(Game game) {
        log.debug("handlePreparingNextRound 진입. 현재 시간: {}, 현재 라운드: {}", game.getTime(), game.getRound());

        if (game.getTime() == 4) {
            log.debug("5초 시점 도달. 라운드 증가 시작.");
            int nextRound = game.getRound() + 1;
            game.setRound(nextRound);
            log.debug("라운드 증가 완료. 새 라운드: {}", nextRound);

            if (nextRound > MAX_ROUNDS) {
                log.debug("최대 라운드 도달. 게임 종료 처리 시작.");
                game.setRoundStatus(GAME_FINISHED);
                game.setTime(3);
                log.debug("상태를 GAME_FINISHED로 변경. 새 시간: {}", game.getTime());
            } else {
                notifyPlayers(game.getGameId(), PREPARING_NEXT_ROUND, "곧 " + nextRound + " 라운드가 시작됩니다...");
            }
        } else if (game.getTime() == 0) {
            game.setRoundStatus(ROUND_START);
            game.setTime(3);
            initializePlayersForNextRound(game);
            log.debug("상태를 ROUND_START로 변경. 새 시간: {}", game.getTime());
        }

        log.debug("handlePreparingNextRound 종료. 최종 시간: {}, 상태: {}, 현재 라운드: {}",
                game.getTime(), game.getRoundStatus(), game.getRound());
    }


    private void handleGameFinish(Game game) throws BaseException {
        if (game.isGameFinished()) {
            return;
        }

        if (game.getTime() == 2) {
            notifyPlayers(game.getGameId(), GAME_FINISHED, "게임이 종료되었습니다! 결과를 합산중입니다...");
            gameService.addInterestToTotalDebtAndLoanProducts(game);
        } else if (game.getTime() == 0) {
            endGame(game);
        }
    }


    // 다음 라운드 시작을 위한 변화값들 초기화
    private void initializePlayersForNextRound(Game game) {
        game.getPlayers().forEach(player -> {
            player.setCarryingStocks(new int[6]);
            player.setCarryingGolds(0);
            player.setAction(null);
            player.setState(null);
        });
    }

    private void notifyRoundStart(String gameId, RoundStatus roundStatus, String message, int currentRound) {
        RoundStartNotificationDto roundStartNotificationDto = RoundStartNotificationDto.builder()
                .roundStatus(roundStatus)
                .message(message)
                .round(currentRound)
                .build();

        StompPayload<RoundStartNotificationDto> payload = new StompPayload<>("GAME_NOTIFICATION", gameId, "GAME_MANAGER", roundStartNotificationDto);
        messagingTemplate.convertAndSend("/sub/" + gameId + "/game", payload);
    }

    public void notifyMainMessage(String gameId, String sender) throws BaseException {
        MainMessageDto mainMessageDto = gameService.getMainMessage(gameId, sender);
        StompPayload<MainMessageDto> mainMessagePayload = new StompPayload<>("MAIN_MESSAGE_NOTIFICATION", gameId, "GAME_MANAGER", mainMessageDto);
        messagingTemplate.convertAndSend("/sub/" + gameId + "/game", mainMessagePayload);
    }

    private void notifyPlayers(String gameId, RoundStatus roundStatus, String message) {
        GameNotificationDto gameNotificationDto2 = GameNotificationDto.builder()
                .roundStatus(roundStatus)
                .message(message)
                .build();

        StompPayload<GameNotificationDto> payload = new StompPayload<>("GAME_NOTIFICATION", gameId, "GAME_MANAGER", gameNotificationDto2);
        messagingTemplate.convertAndSend("/sub/" + gameId + "/game", payload);
    }

    private void notifyPlayersTime(String gameId, int time) {
        TimeNotificationDto timeNotificationDto = TimeNotificationDto.builder()
                .time(time)
                .build();

        StompPayload<TimeNotificationDto> payload = new StompPayload<>("GAME_NOTIFICATION", gameId, "GAME_MANAGER", timeNotificationDto);
        messagingTemplate.convertAndSend("/sub/" + gameId + "/game", payload);
    }

    public void notifyPlayersIndividualMessage(String gameId) throws BaseException {
        List<String> playerNicknames = gameRepository.findPlayerList(gameId);

        for (String playerNickname : playerNicknames) {
            IndividualMessageDto individualMessage = gameService.getIndividualMessage(gameId, playerNickname);
            StompPayload<IndividualMessageDto> response = new StompPayload<>("INDIVIDUAL_MESSAGE_NOTIFICATION", gameId, playerNickname, individualMessage);
            messagingTemplate.convertAndSend("/sub/" + gameId + "/game", response);
        }
    }

    // 랭킹 고지 : 라운드 시작시, 20초마다, 주가 변동, 개인 거래
    public void notifyPlayersRankingMessage(Game game) throws BaseException {
        PlayerRankingResponse playerRankingResponse = gameService.getPlayerRanking(game);
        StompPayload<PlayerRankingResponse> payload = new StompPayload<>("RANKING_NOTIFICATION", game.getGameId(), "GAME_MANAGER", playerRankingResponse);
        messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", payload);
    }

    // 주울 돈 알림
    private void notifyMoneyPoints(String gameId, List<MoneyPoint> moneyPoints) {
        StompPayload<List<MoneyPoint>> payload = new StompPayload<>("MONEY_POINTS", gameId, "GAME_MANAGER", moneyPoints);
        messagingTemplate.convertAndSend("/sub/" + gameId + "/game", payload);
    }

    private void endGame(Game game) throws BaseException {
        if (game.isGameFinished()) {
            return;
        }

        notifyPlayers(game.getGameId(), GAME_FINISHED, "게임 결과");
        GameResultResponse result = gameService.gameResult(game);
        StompPayload<GameResultResponse> gameResultResponseStompPayload = new StompPayload<>("GAME_RESULT", game.getGameId(), "GAME_MANAGER", result);
        messagingTemplate.convertAndSend("/sub/" + game.getGameId() + "/game", gameResultResponseStompPayload);
        log.debug("게임 결과 : {}", result);

        game.finishGame();
        gameRepository.saveGameToRedis(game);
    }

    private void calculateTaxPerPlayer(Game game) {

        int[] stockPrices = Arrays.stream(game.getMarketStocks())
                .map(stockInfo -> {
                    int[] state = stockInfo.getState();
                    return stockState.getStockStandard()[state[0]][state[1]].getPrice();
                })
                .mapToInt(Integer::intValue)
                .toArray();

        game.getPlayers().forEach(player -> {
            int tax = 0;
            System.out.println("playerStocks : " + Arrays.toString(player.getCarryingStocks()));
            System.out.println("playerGolds  : " + player.getCarryingGolds());
            if (!Arrays.stream(player.getCarryingStocks()).allMatch(value -> value == 0) || player.getCarryingGolds() != 0) {
                for (int i = 1; i < 6; i++) {
                    tax += player.getCarryingStocks()[i] * stockPrices[i];
                }
                tax += player.getCarryingGolds() * game.getGoldPrice();
                tax = (int) (tax * 0.4);
                player.setTax(player.getTax() + tax);
            }
            System.out.println("player tax : " + tax + "\n");
        });


    }
}
