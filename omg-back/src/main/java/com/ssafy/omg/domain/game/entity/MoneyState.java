package com.ssafy.omg.domain.game.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class MoneyState {
    //TODO 좌표 변경요망
    public static final Map<String, int[]> MONEY_COORDINATES = Map.of(
            "point1", new int[]{1, 1, 1},
            "point2", new int[]{2, 2, 2},
            "point3", new int[]{3, 3, 3},
            "point4", new int[]{4, 4, 4},
            "point5", new int[]{5, 5, 5},
            "point6", new int[]{6, 6, 6},
            "point7", new int[]{7, 7, 7},
            "point8", new int[]{8, 8, 8},
            "point9", new int[]{9, 9, 9},
            "point10", new int[]{10, 10, 10}
    );

    private List<MoneyPoint> moneyPoints;

    public void initializeMoneyPoints() {
        List<String> allMoneyPointKeys = new ArrayList<>(MONEY_COORDINATES.keySet());
        moneyPoints = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < 5; i++) {
            int index = random.nextInt(allMoneyPointKeys.size());
            String moneyPointKey = allMoneyPointKeys.remove(index);
            int[] coordinates = MONEY_COORDINATES.get(moneyPointKey);
            int status = random.nextInt(2) + 1;
            moneyPoints.add(new MoneyPoint(coordinates, status));
        }
    }

    public List<MoneyPoint> getMoneyPoints() {
        return this.moneyPoints;
    }

}
