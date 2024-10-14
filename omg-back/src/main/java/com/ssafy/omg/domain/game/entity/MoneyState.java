package com.ssafy.omg.domain.game.entity;

import lombok.Getter;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class MoneyState {
    public static final Map<String, List<double[]>> MONEY_COORDINATES = new LinkedHashMap<>();
    @Getter
    private List<MoneyPoint> moneyPoints;
    private Map<String, MoneyPoint> moneyPointMap;


    static {
        // 총 17개 그룹
        // 고정좌표 그룹
        MONEY_COORDINATES.put("point1", Arrays.asList(new double[]{3, -7.5, -10}));
        MONEY_COORDINATES.put("point2", Arrays.asList(new double[]{-2, -7.5, 20}));
        MONEY_COORDINATES.put("point3", Arrays.asList(new double[]{-17, -7.5, 10}));
        MONEY_COORDINATES.put("point4", Arrays.asList(new double[]{-19, -7.5, 8}));
        MONEY_COORDINATES.put("point5", Arrays.asList(new double[]{-24, -7.5, -8}));
        MONEY_COORDINATES.put("point6", Arrays.asList(new double[]{100, -7.5, -16}));
        MONEY_COORDINATES.put("point7", Arrays.asList(new double[]{103, -7.5, 22}));
        MONEY_COORDINATES.put("point8", Arrays.asList(new double[]{90, -7.5, 28}));
        MONEY_COORDINATES.put("point9", Arrays.asList(new double[]{55, -7.5, 78}));

        // 범위좌표 그룹
        MONEY_COORDINATES.put("point10", IntStream.rangeClosed(18, 20)
                .mapToObj(z -> new double[]{-3, -7.5, z})
                .collect(Collectors.toList()));

        MONEY_COORDINATES.put("point11", IntStream.rangeClosed(28, 30)
                .mapToObj(x -> new double[]{x, -7.5, -10})
                .collect(Collectors.toList()));

        MONEY_COORDINATES.put("point12", IntStream.rangeClosed(-16, -8)
                .mapToObj(z -> new double[]{5, -7.5, z})
                .collect(Collectors.toList()));

        MONEY_COORDINATES.put("point13", IntStream.rangeClosed(-10, 20)
                .mapToObj(z -> new double[]{0, -7.5, z})
                .collect(Collectors.toList()));

        MONEY_COORDINATES.put("point14", IntStream.rangeClosed(-6, 5)
                .mapToObj(z -> new double[]{-23, -7.5, z})
                .collect(Collectors.toList()));

        MONEY_COORDINATES.put("point15", IntStream.rangeClosed(-17, -6)
                .mapToObj(x -> new double[]{x, -7.5, 13})
                .collect(Collectors.toList()));

        MONEY_COORDINATES.put("point16", IntStream.rangeClosed(-20, -14)
                .mapToObj(x -> new double[]{x, -7.5, 73})
                .collect(Collectors.toList()));

        MONEY_COORDINATES.put("point17", IntStream.rangeClosed(80, 83)
                .mapToObj(x -> new double[]{x, -7.5, 22})
                .collect(Collectors.toList()));
    }

    /**
     * 랜덤 인덱스 생성 후 그 키 제거하면서 좌표리스트 선택 ( 리스트에서 한개 랜덤 선택 )
     */
    public void initializeMoneyPoints() {
        List<String> allMoneyPointKeys = new ArrayList<>(MONEY_COORDINATES.keySet());
        moneyPoints = new ArrayList<>();
        moneyPointMap = new HashMap<>();

        Random random = new Random();
        for (int i = 0; i < 5; i++) {
            int index = random.nextInt(allMoneyPointKeys.size());
            String moneyPointKey = allMoneyPointKeys.remove(index);
            List<double[]> coordinates = MONEY_COORDINATES.get(moneyPointKey);

            // 그룹에서 고르기
            int coordinatesIndex = random.nextInt(coordinates.size());
            double[] selectedCoord = coordinates.get(coordinatesIndex);

            int status = random.nextInt(2) + 1;
            MoneyPoint moneyPoint = new MoneyPoint(moneyPointKey, selectedCoord, status);
            moneyPoints.add(moneyPoint);
            moneyPointMap.put(moneyPointKey, moneyPoint);
        }
    }

    public MoneyPoint getMoneyPointById(String pointId) {
        return moneyPointMap.get(pointId);
    }

    public Map<String, double[]> getActiveMoneyPointCoordinates() {
        return moneyPointMap.entrySet().stream()
                .filter(entry -> entry.getValue().getMoneyStatus() != 0)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().getMoneyCoordinates()
                ));
    }
}
