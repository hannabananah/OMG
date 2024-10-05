package com.ssafy.omg.domain.game;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.player.entity.Player;
import com.ssafy.omg.domain.room.entity.InRoomPlayer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;

@Slf4j
@Repository
@RequiredArgsConstructor
public class GameRepository {

    private final RedisTemplate<String, Arena> redisTemplate;
    private static final String ROOM_PREFIX = "room";

    public List<Arena> findAllArenas() throws BaseException {
        Set<String> keys = redisTemplate.keys(ROOM_PREFIX + "*");
        if (keys != null) {
            return keys.stream()
                    .map(key -> {
                        Arena arena = redisTemplate.opsForValue().get(key);
                        return arena;
                    })
                    .filter(arena -> arena != null)
                    .collect(Collectors.toList());
        } else {
            throw new BaseException(ARENA_NOT_FOUND);
        }
    }

    public List<String> findinRoomPlayerList(String roomId) throws BaseException {
        Arena arena = findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        List<String> players = arena.getRoom().getInRoomPlayers().stream()
                .map(InRoomPlayer::getNickname)
                .collect(Collectors.toList());
        return players;
    }

    public List<String> findPlayerList(String roomId) throws BaseException {
        Arena arena = findArenaByRoomId(roomId).orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));
        List<Player> players = arena.getGame().getPlayers();

        return players.stream()
                .map(Player::getNickname)
                .collect(Collectors.toList());
    }

    public Optional<Arena> findArenaByRoomId(String roomId) {
        return Optional.ofNullable(redisTemplate.opsForValue().get(ROOM_PREFIX + roomId));
    }

    public void saveArena(String roomId, Arena arena) {
            Long currentTtl = redisTemplate.getExpire(ROOM_PREFIX + roomId, TimeUnit.SECONDS);
            redisTemplate.opsForValue().set(ROOM_PREFIX + roomId, arena, currentTtl + 1L, TimeUnit.SECONDS);
    }

    /**
     * Redis 트랜잭션을 수행.
     * operations.watch(key) : 특정 키를 감시해서 그 키가 변경됐는지 검사함. 감시중에 다른곳에서 이 키를 바꾸면 트랜잭션 롤백됨.
     * operations.multi() : 트랜잭션 시작, multi 한 뒤 모든 명령어가 트랜잭션블록에 들어가고 나중에 한번에 처리해줌
     * exec로 커밋
     *
     * @param game
     */
    public void saveGameToRedis(Game game) {
        String key = ROOM_PREFIX + game.getGameId();
        Long currentTtl = redisTemplate.getExpire(key, TimeUnit.SECONDS);

        Arena arena = Arena.builder()
                .roomId(game.getGameId())
                .message("GAME_UPDATED")
                .game(game)
                .build();

        redisTemplate.execute(new SessionCallback<List<Object>>() {
            @Override
            public List<Object> execute(RedisOperations operations) throws DataAccessException {
                operations.watch(key);
                operations.multi();

                if (currentTtl != null && currentTtl > 0) {
                    operations.opsForValue().set(key, arena, currentTtl, TimeUnit.SECONDS);
                } else {
                    operations.opsForValue().set(key, arena, 3600, TimeUnit.SECONDS);
                }

                return operations.exec();
            }
        });
    }
}
