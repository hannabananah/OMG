package com.ssafy.omg.domain.game.dto;

import com.ssafy.omg.domain.game.entity.MoneyPoint;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class MoneyCollectionResponse {
    private List<MoneyPoint> moneyPoints;
}
