package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.domain.game.entity.Game;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

@Component
public class GameEventListener {
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleGameEvent(Game game) {
        String roomId = game.getGameId();
        messagingTemplate.convertAndSend("/sub/" + roomId + "/game", game);
    }
}
