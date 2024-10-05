package com.ssafy.omg.domain.game.service.battle;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class BattleState {
    private Map<String, Integer> playerClicks = new ConcurrentHashMap<>();

    public void updateClickCount(String playerNickname) {
        playerClicks.merge(playerNickname, 0, (oldValue, one) -> oldValue + 1);
    }

    public int getClickCount(String playerNickname) {
        return playerClicks.getOrDefault(playerNickname, 0);
    }
}
