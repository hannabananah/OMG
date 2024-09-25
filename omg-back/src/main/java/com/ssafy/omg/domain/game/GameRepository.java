package com.ssafy.omg.domain.game;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.player.entity.Player;
import com.ssafy.omg.domain.room.entity.InRoomPlayer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;
import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.GAME_NOT_FOUND;

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
        Arena arena = findArenaByRoomId(roomId);
        List<String> players = arena.getRoom().getInRoomPlayers().stream()
                .map(InRoomPlayer::getNickname)
                .collect(Collectors.toList());
        return players;
    }

    public List<String> findPlayerList(String roomId) throws BaseException {
        Arena arena = findArenaByRoomId(roomId);
        List<Player> players = arena.getGame().getPlayers();

        return players.stream()
                .map(Player::getNickname)
                .collect(Collectors.toList());
    }

    public Arena findArenaByRoomId(String roomId) throws BaseException {
        Arena arena = redisTemplate.opsForValue().get(ROOM_PREFIX + roomId);
        if (arena == null || arena.getGame() == null) {
            throw new BaseException(GAME_NOT_FOUND);
        }
        return arena;
    }

    public void saveArena(String roomId, Arena arena) {
        Long currentTtl = redisTemplate.getExpire(ROOM_PREFIX + roomId, TimeUnit.SECONDS);
        redisTemplate.opsForValue().set(ROOM_PREFIX + roomId, arena, currentTtl + 1L, TimeUnit.SECONDS);
    }
}
