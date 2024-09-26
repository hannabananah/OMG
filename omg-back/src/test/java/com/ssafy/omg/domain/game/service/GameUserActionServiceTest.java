package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.UserActionDTO;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.GameStatus;
import com.ssafy.omg.domain.game.entity.StockInfo;
import com.ssafy.omg.domain.player.entity.Player;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.ValueOperations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.INSUFFICIENT_STOCK;
import static com.ssafy.omg.domain.player.entity.PlayerStatus.NOT_STARTED;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class GameUserActionServiceTest {

    @Mock
    private GameRepository gameRepository;

    @Mock
    private ValueOperations<String, Arena> valueOperations;

    @InjectMocks
    private GameServiceImpl gameService;

    private static final String ROOM_ID = "TEST1";
    private static final String PLAYER_NAME = "player1";

    private Arena testArena;
    private Player testPlayer;

    @BeforeEach
    void setUp() throws BaseException {
        MockitoAnnotations.openMocks(this);

        testArena = new Arena();

        String[] inRoomPlayers = new String[]{"player1", "player2", "player3", "player4"};
        int[] pocket = new int[]{0, 23, 23, 23, 23, 23};
        List<Player> players = new ArrayList<>();
        for (int i = 0; i < inRoomPlayers.length; i++) {
            int[] randomStock = gameService.generateRandomStock();
            // pocket에서 뽑은 randomStock 만큼 빼주기
            for (int j = 1; j < randomStock.length; j++) {
                pocket[j] -= randomStock[j];
                if (pocket[j] < 0) {
                    throw new BaseException(INSUFFICIENT_STOCK);
                }
            }

            Player newPlayer = Player.builder()
                    .nickname(inRoomPlayers[i])
                    .characterType(0)
                    .position(new double[]{0, 0, 0})
                    .direction(new double[]{0, 0, 0})
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

        StockInfo[] market = new StockInfo[6];
        market[0] = new StockInfo(0, new int[]{0, 0});

        for (int i = 1; i < 6; i++) {
            market[i] = new StockInfo(8, new int[]{12, 3});
        }

        Game newGame = Game.builder()
                .gameId(ROOM_ID)
                .gameStatus(GameStatus.BEFORE_START)  // 게임 대기 상태로 시작
                .message("GAME_INITIALIZED")
                .players(players)
                .time(5)                            // 한 라운드 2분(120초)으로 설정
                .round(1)                             // 시작 라운드 1
                .roundStatus(null)
                .isStockChanged(new boolean[6])       // 5개 주식에 대한 변동 여부 초기화
                .isGoldChanged(false)
                .currentInterestRate(5)               // 예: 초기 금리 5%로 설정
                .economicEvent(new int[10])           // 초기 경제 이벤트 없음
                .currentStockPriceLevel(0)            // 주가 수준
                .stockTokensPocket(pocket)            // 주머니 초기화
                .marketStocks(market)                 // 주식 시장 초기화
                .stockSellTrack(new int[10])          // 주식 매도 트랙 초기화
                .stockBuyTrack(new int[6])            // 주식 매수 트랙 초기화
                .goldBuyTrack(new int[6])             // 금 매입 트랙 초기화
                .goldPrice(20)                        // 초기 금 가격 20
                .goldPriceIncreaseCnt(0)          // 초기 금괴 매입 개수 0
                .build();

        testArena.setGame(newGame);
        testArena.setMessage("GAME_INITIALIZED");
        testArena.setRoom(null);
        testPlayer = testArena.getGame().getPlayers().get(0);

        when(gameRepository.findArenaByRoomId(ROOM_ID))
                .thenReturn(Optional.ofNullable(testArena));
    }


    @Test
    public void testTakeLoan_Success() throws BaseException {
        // 준비: 대출 요청 payload
        StompPayload<UserActionDTO> payload = new StompPayload<>();
        payload.setRoomId(ROOM_ID);
        payload.setSender(PLAYER_NAME);
        UserActionDTO data = new UserActionDTO();
        data.setAmount(500); // 예시: 500의 대출 금액
        payload.setData(data);

        // 대출 실행
        gameService.takeLoan(payload);

        // 검증: 플레이어의 자산 상태가 대출 후 올바르게 반영되었는지 확인
        assertEquals(1, testPlayer.getHasLoan());
        assertEquals(500, testPlayer.getLoanPrincipal());
        assertEquals(25, testPlayer.getLoanInterest()); // 금리 5%에 대한 이자 계산
        assertEquals(525, testPlayer.getTotalDebt()); // 원금 + 이자
        assertEquals(600, testPlayer.getCash()); // 기존 100 + 대출금 500

        // 검증: arena가 제대로 저장되었는지 확인
        verify(gameRepository, times(1)).saveArena(eq(ROOM_ID), any(Arena.class));
    }

}
