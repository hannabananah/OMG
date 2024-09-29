package com.ssafy.omg.config.baseresponse;

import lombok.Getter;

@Getter
public enum MessageResponseStatus {

    OUT_OF_CASH(2001, "현재 자산이 부족합니다."),

    INVALID_STOCK_LEVEL(3103, "유효하지 않은 주가 수준입니다."),
    LOAN_ALREADY_TAKEN(3104, "이미 대출을 받은 플레이어입니다."),
    AMOUNT_OUT_OF_RANGE(3105, "요청 금액이 대출 한도 범위를 벗어납니다."),
    INVALID_REPAY_AMOUNT(3106, "유효하지 않은 상환 금액입니다."),

    STOCK_NOT_AVAILABLE(500, "주식 시장에 주식 토큰이 존재하지 않습니다."),
    INSUFFICIENT_CASH(501, "주식을 지불할 현금이 부족합니다."),

    // Gold
    INVALID_GOLD_VALUE(3201, "유효하지 않은 금괴 매입수입니다."),

    // RepayLoan
    AMOUNT_EXCEED_DEBT(3108, "상환 금액이 총 부채보다 많습니다."),
    AMOUNT_EXCEED_CASH(3109, "상환 금액이 보유 자산보다 많습니다.");

    private final int code;
    private final String message;

    private MessageResponseStatus(int code, String message) { //BaseResponseStatus 에서 각 해당하는 코드를 생성자로 맵핑
        this.code = code;
        this.message = message;
    }
}
