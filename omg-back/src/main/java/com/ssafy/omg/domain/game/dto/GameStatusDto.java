package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.GameStatus;
import com.ssafy.omg.domain.game.entity.RoundStatus;
import com.ssafy.omg.domain.game.entity.StockInfo;
import com.ssafy.omg.domain.player.entity.Player;

import java.util.List;

public record GameStatusDto(
        GameStatus gameStatus,
        List<Player> players,
        int time,
        int round,
        RoundStatus roundStatus,
        boolean isPaused,
        int pauseTime,
        int currentInterestRate,
        int currentStockPriceLevel,
        StockInfo[] marketStocks,
        int goldPrice
) {
    public static GameStatusDto convertToDto(Game game) {
        return new GameStatusDto(
                game.getGameStatus(),
                game.getPlayers(),
                game.getTime(),
                game.getRound(),
                game.getRoundStatus(),
                game.isPaused(),
                game.getPauseTime(),
                game.getCurrentInterestRate(),
                game.getCurrentStockPriceLevel(),
                game.getMarketStocks(),
                game.getGoldPrice()
        );
    }
}
