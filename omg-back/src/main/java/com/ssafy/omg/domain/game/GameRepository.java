package com.ssafy.omg.domain.game;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.GAME_NOT_FOUND;

@Slf4j
@Repository
@RequiredArgsConstructor
public class GameRepository {

    private final RedisTemplate<String, Arena> redisTemplate;
    private static final String ROOM_PREFIX = "room";

    public Arena findArenaByRoomId(String roomId) throws BaseException {
        Arena arena = redisTemplate.opsForValue().get(ROOM_PREFIX + roomId);
        if (arena == null || arena.getGame() == null) {
            throw new BaseException(GAME_NOT_FOUND);
        }
        return arena;
    }

    public void saveArena(String roomId, Arena arena) {
        Long currentTtl = redisTemplate.getExpire(ROOM_PREFIX + roomId);
        redisTemplate.opsForValue().set(ROOM_PREFIX + roomId, arena, currentTtl, TimeUnit.MINUTES);
    }
}
