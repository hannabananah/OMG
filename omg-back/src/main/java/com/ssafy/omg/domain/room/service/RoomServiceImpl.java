package com.ssafy.omg.domain.room.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.room.dto.CommonRoomRequest;
import com.ssafy.omg.domain.room.dto.CommonRoomResponse;
import com.ssafy.omg.domain.room.entity.InRoomPlayer;
import com.ssafy.omg.domain.room.entity.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.*;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RedisTemplate<String, Arena> redisTemplate;
    // Redis에서 대기방 식별을 위한 접두사 ROOM_PREFIX 설정
    private static final String ROOM_PREFIX = "room";
    private static final String ALPHA_NUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int ROOMID_LENGTH = 10;
    private static final int MAX_PLAYERS = 4;

    /**
     * 고유한 대기방 ID 생성
     *
     * @return roomId 고유한 대기방 ID
     */
    @Override
    public String createRoomId() throws BaseException {
        StringBuilder stringBuilder = new StringBuilder(ROOMID_LENGTH);
        SecureRandom random = new SecureRandom();

        while (stringBuilder.length() < ROOMID_LENGTH) {
            int randomIndex = random.nextInt(ALPHA_NUMERIC_STRING.length());
            stringBuilder.append(ALPHA_NUMERIC_STRING.charAt(randomIndex));
        }

        String roomId = stringBuilder.toString();

        // 대기방 Id 중복검사
        if (Boolean.TRUE.equals(redisTemplate.hasKey(ROOM_PREFIX + roomId))) {
            return createRoomId();
        }

        return roomId;
    }

    /**
     * 대기 방 생성
     *
     * @param userNickname
     * @return
     */
    @Override
    public String createRoom(String userNickname) throws BaseException {
        try {
            String roomId = createRoomId();
            String roomKey = ROOM_PREFIX + roomId;
            System.out.println("방 아이디 : " + roomId);

            Room room = new Room(roomId, userNickname);

            Arena arena = Arena.builder()
                    .roomId(roomId)
                    .message("CREATE_ROOM_SUCCESS")
                    .room(room)
                    .build();

            // Redis에 대기방 정보 저장
            redisTemplate.opsForValue().set(roomKey, arena, 1, TimeUnit.HOURS);

            return roomId;
        } catch (Exception e) {
            e.printStackTrace();
            throw new BaseException(ROOM_CREATION_ERROR);
        }
    }

    /**
     * 대기 방 존재 여부
     *
     * @param roomId
     * @return
     * @throws BaseException
     */
    @Override
    public boolean isRoomExists(String roomId) throws BaseException {
        String roomKey = ROOM_PREFIX + roomId;
        System.out.println("찾을 방 아이디 : " + roomId);

        // 대기방 존재 여부 반환
        Arena arena = redisTemplate.opsForValue().get(roomKey);
        return arena != null && arena.getRoom() != null;
    }

    /**
     * 대기 방 입장
     * 방이 빈 경우 room 생성
     * room에 접속자 nickname 없는 경우 추가
     *
     * @param request
     * @return CommonRoomResponse
     */
    @Override
    public CommonRoomResponse enterRoom(CommonRoomRequest request) throws BaseException {
        String roomKey = ROOM_PREFIX + request.getRoomId();
        String roomId = request.getRoomId();
        String sender = request.getSender();
        String message = request.getMessage();

        // 입력값 오류
        validateRequest(roomId, sender);

        // 대기방 존재하지 않을 경우 예외처리
        Arena arena = redisTemplate.opsForValue().get(roomKey);
        if (arena == null || arena.getRoom() == null) {
            return new CommonRoomResponse(roomId, "GAME_MANAGER", "게임 대기방이 존재하지 않습니다.", null, null);
        }

        // 대기방 인원이 4명이면 꽉 찼으므로 예외처리
        Room room = arena.getRoom();
        if (isRoomFull(room)) {
//            throw new BaseException(ROOM_FULLED_ERROR);
            return new CommonRoomResponse(roomId, "GAME_MANAGER", "게임 대기방이 꽉 차 참여할 수 없습니다.", null, null);
        }

        boolean isNewPlayer = !isPlayerInRoom(room, sender);
        if (isNewPlayer) {
            addPlayer(room, sender);
            arena.setRoom(room);
            arena.setMessage("ENTER_SUCCESS");
            redisTemplate.opsForValue().set(roomKey, arena, 1, TimeUnit.HOURS);
        } else {
            throw new BaseException(ALREADY_ENTERED_ERROR);
        }

        return new CommonRoomResponse(roomId, sender, "ENTER_SUCCESS", null, room);
    }

    /**
     * 대기 방 나가기
     * 방장이 방을 나가면 그 다음 inRoomPlayer중 처음인 사람을 newHost로 설정
     *
     * @param request
     * @return
     */
    @Override
    public CommonRoomResponse leaveRoom(CommonRoomRequest request) throws BaseException {
        String roomKey = ROOM_PREFIX + request.getRoomId();
        String roomId = request.getRoomId();
        String sender = request.getSender();

        // 입력값 오류
        validateRequest(roomId, sender);

        Arena arena = getArena(roomKey);

        Room room = arena.getRoom();
        // 대기방 존재하지 않을 경우 예외처리
        if (room == null) {
            throw new BaseException(ROOM_NOT_FOUND);
        }

        // 대기방에 존재하지 않는 사람일 경우 예외처리
        if (!isPlayerInRoom(room, sender)) {
            throw new BaseException(USER_NOT_IN_ROOM);
        }

        removePlayer(room, sender);

        if (getPlayerCount(room) == 0) {
            redisTemplate.delete(roomKey);
            return new CommonRoomResponse(roomId, sender, "ROOM_DELETED", null, null);
        } else if (sender.equals(room.getHostNickname())) {
            String newHost = room.getInRoomPlayers().get(0).getNickname();
            room.setHostNickname(newHost);
        }

        arena.setRoom(room);
        arena.setMessage("LEAVE_ROOM");
        redisTemplate.opsForValue().set(roomKey, arena, 1, TimeUnit.HOURS);
        return new CommonRoomResponse(roomId, sender, "LEAVE_ROOM", null, room);
    }

    /**
     * 시작 버튼 활성화 여부
     * 방장이면서 4명이 꽉 찼을 때 game start 버튼 활성화
     *
     * @param request
     * @return
     */
    @Override
    public boolean isStartButtonActive(CommonRoomRequest request) throws BaseException {
        String roomKey = ROOM_PREFIX + request.getRoomId();
        String sender = request.getSender();
        Arena arena = getArena(roomKey);

        Room room = arena.getRoom();
        boolean isHost = room.getHostNickname().equals(sender);
        return isHost && getPlayerCount(room) == MAX_PLAYERS;
    }

    /**
     * 시작 버튼 클릭
     *
     * @param request
     * @return
     */
    @Override
    public CommonRoomResponse clickStartButton(CommonRoomRequest request) throws BaseException {
        String roomId = request.getRoomId();
        String sender = request.getSender();
        if (!isStartButtonActive(request)) {
            throw new BaseException(INSUFFICIENT_PLAYER_ERROR);
        }
        Room room = getRoom(roomId);
        return new CommonRoomResponse(roomId, sender, "START_BUTTON_CLICKED", null, room);
    }

    /**
     * 각 사용자 렌더 완료 표시
     *
     * @param request
     * @return
     * @throws BaseException
     */
    @Override
    public CommonRoomResponse handleRenderedComplete(CommonRoomRequest request) throws BaseException {
        String roomKey = ROOM_PREFIX + request.getRoomId();
        String roomId = request.getRoomId();
        String sender = request.getSender();
        Arena arena = getArena(roomKey);

        Room room = arena.getRoom();

        // 유저 체크까지 진행 후 렌더링값 true로 바꾸기
        setPlayerRendered(room, sender, true);

        arena.setRoom(room);
        arena.setMessage(sender + " RENDERED_COMPLETE");
        redisTemplate.opsForValue().set(roomKey, arena, 1, TimeUnit.HOURS);

        return new CommonRoomResponse(roomId, sender, "RENDERED_COMPLETE", null, room);
    }

    @Override
    public boolean isAllRenderedCompleted(String roomId) throws BaseException {
        String roomKey = ROOM_PREFIX + roomId;
        Arena arena = getArena(roomKey);
        Room room = arena.getRoom();
        return isAllRendered(room);
    }

    /**
     * 모든 사용자 렌더 완료 여부
     *
     * @param roomId
     * @return
     * @throws BaseException
     */
    @Override
    public CommonRoomResponse checkAllRenderedCompleted(String roomId) throws BaseException {
        String roomKey = ROOM_PREFIX + roomId;
        Arena arena = getArena(roomKey);

        Room room = arena.getRoom();
        if (isAllRendered(room)) {
            arena.setMessage("RENDER_COMPLETE_ACCEPTED");
            redisTemplate.opsForValue().set(roomKey, arena, 1, TimeUnit.HOURS);
            return new CommonRoomResponse(roomId, "GAME_MANAGER", "RENDER_COMPLETE_ACCEPTED", null, room);
        } else {
            throw new BaseException(RENDER_NOT_COMPLETED);
        }
    }

    /**
     * 방 정보 반환
     *
     * @param roomId
     * @return
     * @throws BaseException
     */
    @Override
    public Room getRoom(String roomId) throws BaseException {
        String roomKey = ROOM_PREFIX + roomId;
        Arena arena = redisTemplate.opsForValue().get(roomKey);
        if (arena == null || arena.getRoom() == null) {
            throw new BaseException(ROOM_NOT_FOUND);
        }
        Room room = arena.getRoom();
        return room;
    }

    /**
     * 방 정보 업데이트
     *
     * @param room
     * @throws BaseException
     */
    @Override
    public void updateRoom(Room room) throws BaseException {
        String roomKey = ROOM_PREFIX + room.getRoomId();
        Arena arena = redisTemplate.opsForValue().get(roomKey);
        arena.setRoom(room);
        redisTemplate.opsForValue().set(roomKey, arena, 1, TimeUnit.HOURS);
    }

    /**
     * 방이 가득 찼는지 확인
     *
     * @param room 확인할 방 정보
     * @return 방이 가득 찼으면 true, 그렇지 않으면 false
     */
    private boolean isRoomFull(Room room) {
        return getPlayerCount(room) >= MAX_PLAYERS;
    }

    /**
     * 특정플레이어 방에 있는지 확인
     *
     * @param room     확인할 방 정보
     * @param nickname 확인할 플레이어의 닉네임
     * @return 플레이어가 방에 있으면 true, 없으면 false
     */
    private boolean isPlayerInRoom(Room room, String nickname) {
        return room.getInRoomPlayers().stream()
                .anyMatch(player -> player.getNickname().equals(nickname));
    }

    /**
     * 플레이어 추가
     *
     * @param room     플레이어를 추가할 방 정보
     * @param nickname 추가할 플레이어의 닉네임
     */
    private void addPlayer(Room room, String nickname) {
        room.getInRoomPlayers().add(new InRoomPlayer(nickname, false));
    }

    /**
     * 특정 플레이어를 제거
     *
     * @param room     플레이어를 제거할 방 정보
     * @param nickname 제거할 플레이어의 닉네임
     */
    private void removePlayer(Room room, String nickname) {
        room.getInRoomPlayers().removeIf(player -> player.getNickname().equals(nickname));
    }

    /**
     * 방 내부 현재 플레이어수 반환
     *
     * @param room 플레이어 수를 확인할 방 정보
     * @return 방의 현재 플레이어 수
     */
    private int getPlayerCount(Room room) {
        return room.getInRoomPlayers().size();
    }

    /**
     * 모든 플레이어 렌더링여부 확인
     * 메소드 레퍼런스로 InRoomPlayer객체의 isRendered 호출
     *
     * @param room 확인할 방 정보
     * @return 모든 플레이어가 렌더링을 완료했으면 true, 그렇지 않으면 false
     */
    private boolean isAllRendered(Room room) {
        return room.getInRoomPlayers().stream().allMatch(InRoomPlayer::isRendered);
    }

    /**
     * 특정 플레이어 렌더링 상태를 설정
     *
     * @param room       플레이어가 있는 방 정보
     * @param nickname   렌더링 상태를 설정할 플레이어의 닉네임
     * @param isRendered 설정할 렌더링 상태
     */
    private void setPlayerRendered(Room room, String nickname, boolean isRendered) throws BaseException {
        room.getInRoomPlayers().stream()
                .filter(player -> player.getNickname().equals(nickname))
                .findFirst()
                .orElseThrow(() -> new BaseException(USER_NOT_IN_ROOM))
                .setRendered(isRendered);
    }

    /**
     * 요청의 입력유효성 검사
     *
     * @param sender 요청을 보낸 사용자의 닉네임
     * @throws BaseException roomId나 sender가 null이거나 비어있을 경우 발생
     */
    private void validateRequest(String roomId, String sender) throws BaseException {
        if (roomId == null || roomId.isEmpty() || sender == null || sender.isEmpty()) {
            throw new BaseException(REQUEST_ERROR);
        }
    }

    /**
     * Redis에서 arena를 가져오기
     *
     * @param roomKey Redis에서 사용하는 방의 키
     * @return 방의 arena
     * @throws BaseException 방을 찾을 수 없을 경우 발생
     */
    private Arena getArena(String roomKey) throws BaseException {
        Arena arena = redisTemplate.opsForValue().get(roomKey);
        if (arena == null || arena.getRoom() == null) {
            throw new BaseException(ROOM_NOT_FOUND);
        }
        return arena;
    }

}