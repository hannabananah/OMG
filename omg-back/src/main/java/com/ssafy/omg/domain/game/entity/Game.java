package com.ssafy.omg.domain.game.entity;

import java.util.HashMap;
import java.util.List;

import com.ssafy.omg.domain.player.entity.Player;

/**
 * 게임 정보
 * 		- 금리, 경제카드, 주가수준, 금괴가격, 주머니, 금괴 매입개수별 추가,
 * 		- 주식 시장(종류별 개수, 주가), [매수트랙 매도트랙 금괴트랙], 라운드 수, 라운드 별 행위 순서,
 * 		- 한 라운드 시간, 주가 변동 여부 체크, 주가수준 계산(2차원배열?)
 */

public class Game {

	// 게임 정보
	private String gameId; 						// 게임 세션 아이디
	private GameStatus gameStatus; 				// 현재 게임 진행 상태 (시작 전, 진행 중, 게임 종료)
	private String message;		 				// 게임 통신 규약
	private HashMap<Integer, Player> players; 	// player 객체 정보 (총 4명, Key:0~3)

	// 라운드 정보
	private int time;							// 라운드 남은 시간
	private int turn; 							// 현재 턴 (라운드별 행위 순서)
	private int round;							// 현재 라운드
	private List<Integer> playerOrder;			// 플레이어 순서
	private int isStockPriceChanged;			// 주가 변동 여부 체크

	// [게임] 정보
	private int interestRate; 					// 금리
	private int economicCard;					// 경제 카드
	private int stockPriceLevel;				// 현재 주가 수준

	// [게임] 게임판 트랙 정보 & 주머니
	private int[] pocket; 						// 주머니
	private int[] stockSale;					// 매도 트랙
	private int[] stockBuy;						// 매수 트랙
	private int[] goldBuy;						// 금 매입 트랙

	// [게임] 금괴 정보
	private int goldPrice;						// 금괴 가격
	private int goldCnt;						// 금괴 매입 개수

	// [게임]
	private StockInfo[] stockInfos; 			// 현재 주식 상황 (주식시장(종류별 개수), 주가)

	// 5가지 주식
	class StockInfo {
		private int cnt;     // 주식 시장의 주식토큰 개수
		private int[] state; // 현재 주식의 가격을 stockStandard(주가 기준표) 2차원 배열의 위치값으로 표현

		public StockInfo(int cnt, int[] state) {
			this.cnt = cnt;
			this.state = state;
		}
	}

	// 주가 기준표
	private Stock[][] stockStandard =  {
			{new Stock(150, 8), new Stock(175, 8), new Stock(190, 8), new Stock(200, 9), new Stock(210, 9), new Stock(225, 9), new Stock(240, 9)},
			{new Stock(135, 7), new Stock(150, 7), new Stock(160, 8), new Stock(170, 8), new Stock(180, 8), new Stock(200, 8), new Stock(210, 9)},
			{new Stock(115, 6), new Stock(125, 7), new Stock(135, 7), new Stock(145, 7), new Stock(160, 7), new Stock(170, 8), new Stock(180, 8)},
			{new Stock(95, 6),  new Stock(105, 6), new Stock(115, 6), new Stock(125, 6), new Stock(135, 7), new Stock(145, 7), new Stock(155, 7)},
			{new Stock(75, 5),  new Stock(85, 5),  new Stock(95, 5),  new Stock(100, 6), new Stock(110, 6), new Stock(120, 6), new Stock(130, 6)},
			{new Stock(60, 4),  new Stock(70, 4),  new Stock(75, 5),  new Stock(85, 5),  new Stock(90, 5),  new Stock(100, 5), new Stock(110, 6)},
			{new Stock(45, 3),  new Stock(50, 4),  new Stock(60, 4),  new Stock(65, 4),  new Stock(75, 4),  new Stock(85, 5),  new Stock(90, 5)},
			{new Stock(35, 3),  new Stock(40, 3),  new Stock(45, 3),  new Stock(50, 3),  new Stock(60, 4),  new Stock(65, 4),  new Stock(75, 4)},
			{new Stock(25, 2),  new Stock(30, 2),  new Stock(35, 2),  new Stock(40, 3),  new Stock(45, 3),  new Stock(50, 3),  new Stock(60, 3)},
			{new Stock(15, 1),  new Stock(20, 1),  new Stock(25, 2),  new Stock(30, 2),  new Stock(35, 2),  new Stock(40, 2),  new Stock(45, 3)},
			{new Stock(10, 0),  new Stock(12, 1),  new Stock(15, 1),  new Stock(20, 1),  new Stock(25, 1),  new Stock(30, 2),  new Stock(35, 2)},
			{new Stock(6, 0),   new Stock(8, 0),   new Stock(10, 0),  new Stock(12, 0),  new Stock(15, 1),  new Stock(20, 1),  new Stock(25, 1)},
			{new Stock(4, 0),   new Stock(5, 0),   new Stock(6, 0),   new Stock(8, 0),   new Stock(10, 0),  new Stock(12, 0),  new Stock(15, 0)}
	};

	// 주가 기준표의 한 칸
	class Stock {
		private int price;  // 해당 칸의 주가
		private int level;	// 해당 칸의 주가 수준

		public Stock(int price, int level) {
			this.price = price;
			this.level = level;
		}
	}

	/**
	 * 주가 변동 참조표
	 *
	 * - 만약 주가변동참조표에서 양수(3)의 위치로 이동해야 할 경우.
	 * 		StockInfo stockA;
	 * 		stockA.state[0] += dr[3]; stockA.state[1] += dc[3];
	 * - 만약 주가변동참조표에서 음수(-2)의 위치로 이동해야 할 경우.
	 * 		stockA.state[0] += dr[13-2]; stockA.state[1] += dc[13-2];
	 * - 만약 주가변동참조표에서 0의 위치로 이동해야 할 경우.
	 * 		stockA.state[0] += dr[0]; stockA.state[1] += dc[0];
	 */
	private int[] stockDr = {0, -1, -1, 2, 2, 3, 3, -3, -3, -2, -2, -1, -1}; // 0, 1, 2, 3, 4, 5, 6, -6, -5, -4, -3, -2, -1
	private int[] stockDc = {-1, 0,  1, 0, 1, 0, 1,  0, -1,  0, -1,  0, -1}; // 0, 1, 2, 3, 4, 5, 6, -6, -5, -4, -3, -2, -1

}
