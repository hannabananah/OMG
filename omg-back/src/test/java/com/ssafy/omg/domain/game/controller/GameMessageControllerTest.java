package com.ssafy.omg.domain.game.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.BaseResponseStatus;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.dto.PlayerMoveRequest;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.player.entity.Player;
import com.ssafy.omg.domain.room.entity.Room;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.util.ArrayList;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GameMessageControllerTest {

    private WebSocketStompClient stompClient;

    @Autowired
    private RedisTemplate<String, Arena> redisTemplate;

    @Autowired
    private GameRepository gameRepository;


    private static String roomKey = "roomroomId";


    @BeforeEach
    public void setup() {
        this.stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        this.stompClient.setMessageConverter(new MappingJackson2MessageConverter());
    }

    @AfterEach
    public void cleanup() {
        // 테스트 후 Redis에서 Arena 삭제
        if (roomKey != null) {
            redisTemplate.delete(roomKey);
        }
    }

    @Test
    @DisplayName("웹 소켓 연결 테스트")
    public void testWebSocketConnection() throws Exception {
        // WebSocket 연결 URL 설정
        String url = "ws://localhost:8080/omg";

        // WebSocket 연결을 설정
        StompSession session = stompClient.connect(url, new WebSocketHttpHeaders(), new StompSessionHandlerAdapter() {
        }).get(1, TimeUnit.SECONDS);

        // WebSocket 연결이 성공했는지 확인
        assertThat(session.isConnected()).isTrue();
    }

    @Test
    @DisplayName("아레나 생성 테스트")
    public void testCreateArena() {
        // 1. Arena를 생성하여 Redis에 저장
        String roomId = "roomId";
        String userNickname = "player1";

        // Arena 생성
        Room room = new Room(roomId, userNickname);
        Arena arena = Arena.builder()
                .roomId(roomId)
                .message("CREATE_ROOM_SUCCESS")
                .room(room)
                .build();

        // Redis에 Arena 저장
        redisTemplate.opsForValue().set(roomKey, arena, 1, TimeUnit.HOURS);

        // 2. Redis에서 Arena를 가져와서 확인
        Arena retrievedArena = redisTemplate.opsForValue().get(roomKey);

        // 3. Assertions로 검증
        assertThat(retrievedArena).isNotNull(); // Arena가 Redis에 저장되었는지 확인
        assertThat(retrievedArena.getRoomId()).isEqualTo(roomId); // Room ID가 일치하는지 확인
        assertThat(retrievedArena.getRoom().getHostNickname()).isEqualTo(userNickname); // Host nickname이 일치하는지 확인
        assertThat(retrievedArena.getMessage()).isEqualTo("CREATE_ROOM_SUCCESS"); // Message가 일치하는지 확인
    }

    @Test
    @DisplayName("플레이어 좌표 이동 업데이트 테스트")
    public void testPlayerMove() throws Exception {
        // 1. Arena를 생성하여 Redis에 저장
        String roomId = createArena("player1", "roomId");

        try {
            // 2. WebSocket 연결을 설정
            String url = "ws://localhost:8080/omg";
            StompSession session = stompClient.connect(url, new WebSocketHttpHeaders(), new StompSessionHandlerAdapter() {
            }).get(1, TimeUnit.SECONDS);

            assertThat(session.isConnected()).isTrue();

            // 3. /pub/player-move 경로로 메시지를 전송
            // TODO 수정
        //    PlayerMoveRequest request = new PlayerMoveRequest(roomId, "player1", new double[]{0.0, 1.0, 0.0}, new double[]{1.0, 0.0, 0.0});
        //    session.send("/pub/player-move", request);

            // 4. Redis에 저장된 정보 확인
            // 업데이트가 비동기적으로 일어날 수 있으므로 약간의 대기 시간을 두고 확인
            TimeUnit.SECONDS.sleep(1);

            Arena arena = gameRepository.findArenaByRoomId(roomId)
                    .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
            Player player = arena.getGame().getPlayers().stream()
                    .filter(p -> p.getNickname().equals("player1"))
                    .findFirst()
                    .orElse(null);

            assertThat(player).isNotNull();
            assertThat(player.getPosition()).containsExactly(0.0, 1.0, 0.0);
            assertThat(player.getDirection()).containsExactly(1.0, 0.0, 0.0);
        } finally {
            // 5. 테스트가 끝난 후 Arena 삭제
            deleteArena(roomId);
        }
    }

    private String createArena(String userNickname, String roomId) {

        String roomKey = "room" + roomId;
        Game game = Game.builder()
                .build();
        game.setPlayers(new ArrayList<>());
        game.getPlayers().add(Player.builder().nickname(userNickname).build());

        Room room = new Room(roomId, userNickname);
        Arena arena = Arena.builder()
                .roomId(roomId)
                .message("CREATE_ROOM_SUCCESS")
                .room(room)
                .game(game)
                .build();

        // Redis에 대기방 정보 저장
        redisTemplate.opsForValue().set(roomKey, arena, 1, TimeUnit.HOURS);

        return roomId;
    }

    private void deleteArena(String roomId) {
        String roomKey = "room" + roomId;
        redisTemplate.delete(roomKey);
    }



}