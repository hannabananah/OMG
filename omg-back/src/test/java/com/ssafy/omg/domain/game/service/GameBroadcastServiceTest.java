package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.PlayerResponse;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.player.entity.Player;
import com.ssafy.omg.domain.room.entity.Room;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.messaging.simp.SimpMessageSendingOperations;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class GameBroadcastServiceTest {

    @Mock
    private SimpMessageSendingOperations messagingTemplate;

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private GameBroadcastService gameBroadcastService;

    @Captor
    private ArgumentCaptor<List<PlayerResponse>> captor;

    @Mock
    private ScheduledExecutorService mockScheduler;

    private Arena testArena;

    @BeforeEach
    void setUp() throws BaseException {
        MockitoAnnotations.openMocks(this);

        // Mock ScheduledExecutorService creation in the GameBroadcastService
        when(mockScheduler.scheduleWithFixedDelay(any(Runnable.class), anyLong(), anyLong(), any(TimeUnit.class)))
                .thenAnswer(new Answer<Object>() {
                    @Override
                    public Object answer(InvocationOnMock invocation) {
                        ((Runnable) invocation.getArgument(0)).run();
                        return null;
                    }
                });

        // Creating a test Arena with a Game and Players
        Game game = new Game();
        game.setPlayers(List.of(
                Player.builder()
                        .nickname("player1")
                        .position(new double[]{0, 0, 0})
                        .direction(new double[]{1, 0, 0})
                        .build(),
                Player.builder()
                        .nickname("player2")
                        .position(new double[]{1, 1, 1})
                        .direction(new double[]{0, 1, 0})
                        .build(),
                Player.builder()
                        .nickname("player3")
                        .position(new double[]{2, 2, 2})
                        .direction(new double[]{0, 0, 1})
                        .build(),
                Player.builder()
                        .nickname("player4")
                        .position(new double[]{3, 3, 3})
                        .direction(new double[]{1, 1, 0})
                        .build()
        ));

        testArena = new Arena("room1", "INIT", game, new Room("room1", "host"));

        when(gameRepository.findArenaByRoomId("room1")).thenReturn(Optional.ofNullable(testArena));
    }

    @Test
    void testStartBroadcast() throws Exception {
        // Given
        String roomId = "room1";
        when(gameRepository.findArenaByRoomId(roomId)).thenReturn(Optional.ofNullable(testArena));

        // When
        gameBroadcastService.startBroadcast(roomId);

        // Allow some time for the broadcast to occur
        Thread.sleep(100);  // Adjust this value based on your scheduling delay (e.g., 16ms)

        // Then
        verify(messagingTemplate, atLeastOnce()).convertAndSend(eq("/sub/" + roomId + "/game"), anyList());
    }

    @Test
    void testStopBroadcast() throws BaseException, InterruptedException {
        // Given
        String roomId = "room1";
        when(gameRepository.findArenaByRoomId(roomId)).thenReturn(Optional.ofNullable(testArena));

        // Start broadcast (which uses the mockScheduler)
        gameBroadcastService.startBroadcast(roomId);

        assertThat(gameBroadcastService.getSchedulerMap().containsKey(roomId)).isTrue();
        Thread.sleep(200);

        // When
        gameBroadcastService.stopBroadcast(roomId);

        // Then
        assertThat(gameBroadcastService.getSchedulerMap().containsKey(roomId)).isFalse();
    }
}
