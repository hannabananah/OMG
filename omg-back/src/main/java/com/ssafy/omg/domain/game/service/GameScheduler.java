package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.GameStatus;
import com.ssafy.omg.domain.game.entity.RoundStatus;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.INVALID_ROUND_STATUS;
import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ROUND_STATUS_ERROR;
import static com.ssafy.omg.domain.game.entity.RoundStatus.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GameScheduler {

    @Autowired
    private RedisTemplate<String, Arena> redisTemplate;

    private final GameService gameService;
    private final SimpMessageSendingOperations messagingTemplate;
    private static final int MAX_ROUNDS = 10;
/* 
    @Scheduled(fixedRate = 1000)  // 1초마다 실행
    public void updateGameState() throws BaseException {
        try {
            List<Game> activeGames = gameService.getAllActiveGames();
            for (Game game : activeGames) {
                updateRoundStatus(game);
                gameService.saveGame(game);
            }
        } catch (BaseException e) {
            log.info("라운드 진행 상태 업데이트 중 오류가 발생하였습니다.");
            throw new BaseException(ROUND_STATUS_ERROR);
        }
    } */

    /**
     * 시스템 상에서 자동적으로 라운드 진행 및 라운드 상태 변경
     *
     * @param game game 정보
     * @throws BaseException
     */
    private void updateRoundStatus(Game game) throws BaseException {

        switch (game.getRoundStatus()) {
            case TUTORIAL:
                handleTutorial(game);
                break;
            case ROUND_START:
                handleRoundStart(game);
                break;
            case ECONOMIC_EVENT:
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
        log.debug("게임 {}의 현재 시간 : {}초", game.getGameId(), game.getTime());  // 로그 추가
    }

    private void decreasePauseTime(Game game) {
        if (game.isPaused() && game.getPauseTime() > 0) {
            game.setPauseTime(game.getPauseTime() - 1);
        }
        log.debug("게임 {}의 현재 시간 : {}초", game.getGameId(), game.getTime());  // 로그 추가
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
            notifyPlayers(game.getGameId(), +game.getRound() + "라운드가 시작됩니다!");
        } else if (game.getTime() == 0) {
            game.setRoundStatus(ECONOMIC_EVENT);
            game.setTime(5);
            log.debug("상태를 ECONOMIC_EVENT로 변경. 새 시간: {}", game.getTime());
        }
    }

    private void handleEconomicEvent(Game game) throws BaseException {
        if (game.getTime() == 4) {
            try {
                gameService.createGameEventandInterestChange(game.getGameId());
                // TODO 변동금리
                notifyPlayers(game.getGameId(), "경제 이벤트가 발생했습니다!");
            } catch (Exception e) {
                log.debug("경제 이벤트 발생에 실패했습니다 : ", e);
            }
        } else if (game.getTime() == 0) {
            game.setRoundStatus(ROUND_IN_PROGRESS);
            game.setTime(120);
            log.debug("상태를 ROUND_IN_PROGRESS로 변경. 새 시간: {}", game.getTime());
        }
    }

    private void handleRoundInProgress(Game game) throws BaseException {
        if (game.getTime() == 29 || game.getTime() == 9) {
            notifyPlayers(game.getGameId(), game.getTime() + " 초 남았습니다!");
        } else if (game.getTime() == 0) {
            game.setRoundStatus(ROUND_END);
            game.setTime(3);
            log.debug("상태를 ROUND_END로 변경. 새 시간: {}", game.getTime());
        }
    }

    private void handleStockFluctuation(Game game) throws BaseException {
        if (!game.isPaused()) {
            game.setPaused(true);
            game.setPauseTime(5);
            // TODO: 주가변동 gameService 메서드 여기 넣어야함
            notifyPlayers(game.getGameId(), "주가가 변동되었습니다! 5초 후 게임이 재개됩니다.");
        } else {
            if (game.getPauseTime() > 0) {
                game.setPauseTime(game.getPauseTime() - 1);
            }

            if (game.getPauseTime() == 0) {
                game.setPaused(false);
                game.setRoundStatus(RoundStatus.ROUND_IN_PROGRESS);
            }
        }

    }

    private void handleRoundEnd(Game game) throws BaseException {
        log.debug("handleRoundEnd 진입. 현재 시간: {}", game.getTime());

        if (game.getTime() == 2) {
            notifyPlayers(game.getGameId(), game.getRound() + "라운드가 종료되었습니다!");
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
                endGame(game);
            } else {
                notifyPlayers(game.getGameId(), "곧 " + nextRound + " 라운드가 시작됩니다...");
            }
        } else if (game.getTime() == 0) {
            game.setRoundStatus(ROUND_START);
            game.setTime(3);
            log.debug("상태를 ROUND_START로 변경. 새 시간: {}", game.getTime());
        }

        log.debug("handlePreparingNextRound 종료. 최종 시간: {}, 상태: {}, 현재 라운드: {}",
                game.getTime(), game.getRoundStatus(), game.getRound());
    }

    private void notifyPlayers(String gameId, String message) {
        StompPayload<String> payload = new StompPayload<>("GAME_NOTIFICATION", gameId, "GAME_MANAGER", message);
        messagingTemplate.convertAndSend("/sub/" + gameId + "/game", payload);
    }

    private void endGame(Game game) {
        game.setGameStatus(GameStatus.GAME_FINISHED);
        notifyPlayers(game.getGameId(), "게임 종료!");
        // TODO: 게임 종료 후 로직이 필요함, 순위 화면 같은거 계산해서 반환하기 등
    }
}