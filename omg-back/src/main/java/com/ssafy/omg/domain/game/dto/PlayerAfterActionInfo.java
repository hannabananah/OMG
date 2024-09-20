package com.ssafy.omg.domain.game.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlayerAfterActionInfo {
	private String nickname;		// 유저 닉네임
	private int cash;				// 현재 보유한 현금
	private int loan;				// 현재 남은(상환해야 할) 대출금
	private double interestRate;	// 대출 받았을 때의 금리
	private int[] token;			// 현재 보유한 주식의 개수
}
