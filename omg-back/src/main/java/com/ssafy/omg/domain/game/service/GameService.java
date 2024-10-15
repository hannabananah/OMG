package com.ssafy.omg.domain.game.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.config.baseresponse.MessageException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.dto.*;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.GameEvent;
import com.ssafy.omg.domain.socket.dto.StompPayload;

import java.util.List;

public interface GameService {

    // 진행중인(활성화된) 게임 리스트 반환
    List<Game> getAllActiveGames() throws BaseException;

    // 메인판 정보 보낼 DTO 생성 메서드
    MainMessageDto getMainMessage(String roomId, String sender) throws BaseException;

    // 거래소에서 응답으로 보낼 DTO 생성 메서드
    IndividualMessageDto getIndividualMessage(String roomId, String sender) throws BaseException;

    // 게임 변경 값을 Arena에 저장
    void saveGame(Game game) throws BaseException;

    // 게임 초기값 세팅
    Arena initializeGame(String roomId, List<String> inRoomPlayers) throws BaseException;

    // 경제 이벤트 발생(조회) 및 금리 변동 (2~10라운드)
    GameEvent createGameEventNews(String roomId) throws BaseException;

    // 전 라운드 경제 이벤트를 현 라운드에 적용
    Game applyEconomicEvent(String roomId) throws BaseException;

    // 돈 줍기
    MoneyCollectionResponse collectMoney(String roomId, String userNickname, String moneyPoint) throws BaseException;

    // 매입한 금 개수를 플레이어 자산 및 금 매입 트랙( + 추가개수)에 반영
    void purchaseGold(String roomId, String userNickname, int goldButCount) throws BaseException, MessageException;

    // 주가 변동 가능 여부
    boolean isStockFluctuationAble(String roomId) throws BaseException;

    // 주가 변동
    void changeStockPrice(Game game) throws BaseException;

    int calculateLoanLimit(String roomId, String sender) throws BaseException, MessageException;

    void takeLoan(String roomId, String userNickname, int amount) throws BaseException, MessageException;

    void repayLoan(String roomId, String userNickname, int amount) throws BaseException, MessageException;

    void addInterestToTotalDebtAndLoanProducts(Game game);

    void setStocksOnCarryingStocks(String roomId, String sender, int[] stocksToCarry) throws BaseException, MessageException;

    void sellStock(String roomId, String userNickname, int[] amount) throws BaseException;

    void movePlayer(StompPayload<PlayerMoveRequest> playerMoveRequest) throws BaseException;

    void buyStock(StompPayload<StockRequest> data) throws BaseException, MessageException;

    // 주가 차트 생성
    void setStockPriceChangeInfo(Game game, int round, int remainTime);

    // 금 차트 생성
    void setGoldPriceChartInfo(Game game, int round, int remainTime) throws BaseException;

    // 주식 거래소 정보 생성
    StockMarketResponse createStockMarketInfo(Game game);

    // 금 매입소 정보 생성
    GoldMarketInfoResponse createGoldMarketInfo(Game game) throws BaseException;

    // 게임 중 순자산으로 플레이어별 랭킹 계산 후 응답 생성
    PlayerRankingResponse getPlayerRanking(Game game) throws BaseException;

    // 게임 종료시 결과 정보 생성
    GameResultResponse gameResult(Game game) throws BaseException;
}
