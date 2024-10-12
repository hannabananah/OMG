package com.ssafy.omg.domain.game.entity;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class MoneyState {
    //TODO 좌표 변경요망
    public static final Map<String, double[]> MONEY_COORDINATES = Map.of(
            "point1", new double[]{1, 1, 1},
            "point2", new double[]{2, 2, 2},
            "point3", new double[]{3, 3, 3},
            "point4", new double[]{4, 4, 4},
            "point5", new double[]{5, 5, 5},
            "point6", new double[]{6, 6, 6},
            "point7", new double[]{7, 7, 7},
            "point8", new double[]{8, 8, 8},
            "point9", new double[]{9, 9, 9},
            "point10", new double[]{10, 10, 10}
    );

    private List<MoneyPoint> moneyPoints;

    public void initializeMoneyPoints() {
        List<String> allMoneyPointKeys = new ArrayList<>(MONEY_COORDINATES.keySet());
        moneyPoints = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < 5; i++) {
            int index = random.nextInt(allMoneyPointKeys.size());
            String moneyPointKey = allMoneyPointKeys.remove(index);
            double[] coordinates = MONEY_COORDINATES.get(moneyPointKey);
            int status = random.nextInt(2) + 1;
            moneyPoints.add(new MoneyPoint(coordinates, status));
        }
    }

    public List<MoneyPoint> getMoneyPoints() {
        return this.moneyPoints;
    }

}
