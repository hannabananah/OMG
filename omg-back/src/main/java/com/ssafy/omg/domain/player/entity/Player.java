package com.ssafy.omg.domain.player.entity;

import com.ssafy.omg.domain.game.entity.LoanProduct;
import com.ssafy.omg.domain.player.dto.PlayerAnimation;
import lombok.*;

import java.util.TreeSet;

/**
 * 플레이어 정보
 * - 대출 유무, 대출금,이자율, 현금, 금괴개수, 보유 주식, 플레이어 좌표(x, y, z),
 * - 플레이어 행위(무슨 행동을 하는지), 플레이어 행위 종료 상태, 플레이어 접속 상태, 한 행위 시간
 */
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
public class Player {
    private String nickname;           // 플레이어 닉네임

    // 메인 맵 관련
    private int characterType;
    private boolean characterMovement; // 줍기 행동 유무
    private double[] position = new double[3];         // 플레이어 좌표(x, y, z)
    private double[] direction = new double[3];        // 플레이어 방향
    private boolean actionToggle = false;
    private int[] carryingStocks = new int[6];// 플레이어별 집에 가지고 갈 주식
    private int carryingGolds;

    // 거래소 관련
    private TreeSet<LoanProduct> loanProducts = new TreeSet<>();
    private int totalDebt;             // 총 부채
    private int cash;                  // 현금
    private int[] stock = new int[6];  // 보유 주식 개수
    private int goldOwned;             // 보유 금괴 개수

    private PlayerAction action;       // 플레이어 행위 (주식 매수, 주식 매도, 금괴 매입, 대출, 상환)
    private PlayerStatus state;        // 플레이어 행위 상태 (시작전, 진행중, 완료)
    private boolean battleState;
    private boolean battleRequestPending = false;
    @Getter
    private String battleRequestFrom = null;
    private int isConnected;           // 플레이어 접속 상태 (0: 끊김, 1: 연결됨)
    private boolean isTrading;
    private boolean isCarrying;
    private PlayerAnimation animation;

    private int tax;          // carryingStocks나 carryingGolds가 있는 상태로 게임이 끝났을 경우 세금 부과

    public void addCash(int amount) {
        this.cash += amount;
    }

    public boolean sendActionToggle() {
        if (this.actionToggle) {
            this.actionToggle = false;
            return true;
        }
        return false;
    }

    public double distanceTo(Player other) {
        return Math.sqrt(Math.pow(this.position[0] - other.position[0], 2) + Math.pow(this.position[2] - other.position[2], 2));
    }

    public void setBattleRequestPending(boolean pending, String from) {
        this.battleRequestPending = pending;
        this.battleRequestFrom = from;
    }

    public void clearBattleRequest() {
        this.battleRequestPending = false;
        this.battleRequestFrom = null;
    }
}
