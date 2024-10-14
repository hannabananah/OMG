package com.ssafy.omg.config.baseresponse;

import lombok.Getter;

@Getter
public enum BaseResponseStatus {
    /**
     * 1000 : 요청 성공
     */
    SUCCESS(true, 1000, "요청에 성공하였습니다."),

    /**
     * 2000 : Request 오류
     */
    // Common
    REQUEST_ERROR(false, 2000, "입력값을 확인해주세요."),
    EMPTY_JWT(false, 2001, "JWT를 입력해주세요."),
    INVALID_JWT(false, 2002, "유효하지 않은 JWT입니다."),
    INVALID_USER_JWT(false, 2003, "권한이 없는 유저의 접근입니다."),
    JWT_GET_USER_ERROR(false, 2004, "User 권한 인증 중 에러가 발생하였습니다."),
    JWT_KEY_GENERATE_ERROR(false, 2005, "JWT 토큰 발행 중 에러가 발생하였습니다."),
    INVALID_REFRESH_TOKEN(false, 2006, "리프레시 토큰이 유효하지 않습니다."),

    /**
     * 3000 : Response 오류
     */
    // Common
    RESPONSE_ERROR(false, 3000, "값을 불러오는데 실패하였습니다."),

    // 3001 ~~ 3099 : 김현재

    // user
    GET_USER_EMPTY(false, 3001, "등록된 유저가 없습니다."),
    FAILED_USER_SIGNUP(false, 3002, "등록된 유저가 없습니다."),
    NOT_FOUND_USER(false, 3003, "유저 정보가 없습니다."),
    INVALID_PASSWORD(false, 3004, "비밀번호가 일치하지 않습니다."),
    PASSWORD_ENCRYPTION_ERROR(false, 3005, "암호화된 비밀번호가 일치하지 않습니다."),
    ERROR_MODIFY_NICKNAME(false, 3006, "닉네임 변경 중 오류가 발생하였습니다."),
    EMPTY_REQUEST_PASSWORD(false, 3007, "비밀번호를 입력해주세요."),

    // websocket
    WEBSOCKET_CONNECTION_ERROR(false, 3011, "WebSocket 연결 중 오류가 발생하였습니다."),
    WEBSOCKET_MESSAGE_PROCESSING_ERROR(false, 3012, "WebSocket 메시지 처리 중 오류가 발생하였습니다."),

    // room
    ROOM_CREATION_ERROR(false, 3021, "게임 대기방 생성 중 오류가 발생하였습니다."),
    ROOM_NOT_FOUND(false, 3022, "게임 대기방이 존재하지 않습니다."),
    ROOM_FULLED_ERROR(false, 3023, "게임 대기방이 꽉 차 참여할 수 없습니다."),
    INSUFFICIENT_PLAYER_ERROR(false, 3024, "게임 시작에 필요한 플레이어 수가 충분하지 않습니다."),
    ALREADY_ENTERED_ERROR(false, 3025, "이미 게임 대기방에 참여중입니다."),
    USER_NOT_IN_ROOM(false, 3026, "대기방에서 유저를 찾을 수 없습니다."),
    RENDER_NOT_COMPLETED(false, 3027, "모든 유저의 렌더가 완료되지 않았습니다."),

    // game
    ARENA_NOT_FOUND(false, 3031, "아레나가 존재하지 않습니다."),
    INVALID_ROUND(false, 3032, "경제 이벤트가 발생하기에 유효하지 않은 라운드입니다."),
    EVENT_NOT_FOUND(false, 3033, "경제 이벤트가 존재하지 않습니다."),
    INSUFFICIENT_STOCK(false, 3034, "주머니에 주식 개수가 충분하지 않습니다."),
    ROUND_STATUS_ERROR(false, 3035, "라운드 진행 상태 업데이트 중 오류가 발생하였습니다."),
    INVALID_ROUND_STATUS(false, 3036, "유효하지 않은 라운드 상태값입니다."),
    PLAYER_STATE_ERROR(false, 3037, "거래할 수 없는 플레이어 상태입니다"),
    INVALID_STOCK_GROUP(false, 3038, "유효하지 않은 주식 산업 그룹입니다."),
    INVALID_MARKET_INFO(false, 3039, "거래소 정보 전송에 실패했습니다."),
    INVALID_MONEY_POINT(false, 3041, "유효하지 않은 돈 좌표입니다."),
    MONEY_POINT_NOT_FOUND(false, 3042, "해당 좌표에 돈이 존재하지 않습니다."),
    MONEY_ALREADY_COLLECTED(false, 3043, "이미 주워진 돈입니다."),


    // 3101 ~~ 3199 : 이가은
    GAME_NOT_FOUND(false, 3101, "게임이 존재하지 않습니다."),
    PLAYER_NOT_FOUND(false, 3102, "플레이어가 존재하지 않습니다."),
    INVALID_STOCK_LEVEL(false, 3103, "유효하지 않은 주가 수준입니다."),
    LOAN_ALREADY_TAKEN(false, 3104, "이미 대출을 받은 플레이어입니다."),
    AMOUNT_OUT_OF_RANGE(false, 3105, "요청 금액이 대출 한도 범위를 벗어납니다."),
    INVALID_SELL_STOCKS(false, 3106, "매도 가능한 주식 개수가 아닙니다."),
    INVALID_STOCK_STATE(false, 3107, "유효하지 않은 주가 기준표의 좌표입니다."), // TODO message로 보낼 필요 없는 예외 상황입니다.
    INVALID_BLACK_TOKEN(false, 3110, "유효한 검은 토큰 개수가 아닙니다."),
    IMPOSSIBLE_STOCK_CNT(false, 3113, "거래 주식 개수가 0 이하이거나 주가수준 거래 가능 토큰 개수를 초과합니다."),
    EXCEEDS_DIFF_RANGE(false, 3114, "주가 조정 참조표의 -6보다 더 적은 값입니다."),

    // 3201 ~~ 3299 : 전정민


    /**
     * 4000 : Database, Server
     */
    DATABASE_ERROR(false, 4000, "데이터베이스 연결에 실패하였습니다."),

    /**
     * 5000 : Server 오류
     */
    SERVER_ERROR(false, 5000, "서버와의 연결에 실패하였습니다."),
    GAME_SAVE_FAILED(false, 5001, "게임 상태 저장에 실패했습니다.");;

    private final boolean isSuccess;
    private final int code;
    private final String message;

    private BaseResponseStatus(boolean isSuccess, int code, String message) { //BaseResponseStatus 에서 각 해당하는 코드를 생성자로 맵핑
        this.isSuccess = isSuccess;
        this.code = code;
        this.message = message;
    }
}
