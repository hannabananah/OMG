package com.ssafy.omg.domain.chat.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.game.entity.Game;
import com.ssafy.omg.domain.game.entity.StockInfo;
import com.ssafy.omg.domain.game.entity.StockState;
import com.ssafy.omg.domain.player.entity.Player;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.ARENA_NOT_FOUND;
import static com.ssafy.omg.config.baseresponse.BaseResponseStatus.PLAYER_NOT_FOUND;
import static org.hibernate.query.sqm.tree.SqmNode.log;


@Service
public class ChatbotServiceImpl implements ChatbotService {
    private static final Logger logger = LoggerFactory.getLogger(ChatbotServiceImpl.class);
    private final WebClient webClient;
    private final GameRepository gameRepository;
    private final ObjectMapper objectMapper;

    public ChatbotServiceImpl(GameRepository gameRepository, @Value("${claude.api-key}") String claudeApiKey) {
        this.gameRepository = gameRepository;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.anthropic.com/v1")
                .defaultHeader("X-API-Key", claudeApiKey)
                .defaultHeader("anthropic-version", "2023-06-01")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public Mono<String> getChatbotResponse(String roomId, String userNickname, String userMessage) throws BaseException {
        Arena arena = gameRepository.findArenaByRoomId(roomId)
                .orElseThrow(() -> new BaseException(ARENA_NOT_FOUND));

        Player currentPlayer = arena.getGame().getPlayers().stream()
                .filter(player -> player.getNickname().equals(userNickname))
                .findFirst()
                .orElseThrow(() -> new BaseException(PLAYER_NOT_FOUND));

        String prompt = buildPrompt(arena, currentPlayer, userMessage);
        String requestBody = buildRequestBody(prompt);
        logger.info("API Request Body: {}", requestBody);

        return webClient.post()
                .uri("/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .doOnNext(response -> logger.info("API Response: {}", response))
                .map(this::extractResponseContent)
                .onErrorResume(WebClientResponseException.class, e -> {
                    logger.error("API Error: {}, Response Body: {}", e.getMessage(), e.getResponseBodyAsString());
                    return Mono.just("징글벨~ 앗, 산타의 마법 주머니에 작은 구멍이 났나 봐! 잠깐만 기다려줘. 요정들이 금방 고칠 거야!");
                })
                .onErrorResume(Exception.class, e -> {
                    log.error("Unexpected error", e);
                    return Mono.just("호호호~ 이런, 산타의 선물 포장기가 잠깐 고장 났나 봐! 다시 한 번 말해줄래? 이번엔 제대로 들을 수 있을 거야!");
                });
    }

    private String buildPrompt(Arena arena, Player currentPlayer, String userMessage) {
        Game game = arena.getGame();
        String gameAnalysis = analyzeGameData(game, currentPlayer);
        String gameRules = getGameRules();

        return String.format(
                "너는 크리스마스 요정이야. 플레이어를 도와주는 역할이지. 반말로 대답하고, 항상 밝고 격려하는 말투를 사용해. '크리스마스 요정'이라는 단어를 직접 언급하지 마.\n" +
                        "라운드: %d\n" +
                        "게임 분석:\n%s\n" +
                        "게임 규칙:\n%s\n" +
                        "플레이어 질문: %s\n" +
                        "300자 이내로 힌트를 줘. 직접적인 답은 피하고, 항상 밝고 격려하는 말투로 대답해. 문장이 끊기지 않도록 주의해.",
                game.getRound(),
                gameAnalysis,
                gameRules,
                userMessage
        );
    }


    private String analyzeGameData(Game game, Player currentPlayer) {
        StringBuilder analysis = new StringBuilder();

        analysis.append(String.format("현재 금리: %d%%\n", game.getCurrentInterestRate()));
        analysis.append(String.format("금 가격: %d\n", game.getGoldPrice()));

        StockInfo[] marketStocks = game.getMarketStocks();
        analysis.append("주식 가격 정보:\n");
        for (int i = 1; i < marketStocks.length; i++) {
            int[] state = marketStocks[i].getState();
            int price = new StockState().getStockStandard()[state[0]][state[1]].getPrice();
            analysis.append(String.format("주식 %d: %d\n", i, price));
        }

        // 플레이어 특정 정보 추가
        analysis.append("\n플레이어 정보:\n");
        analysis.append(String.format("현금: %d\n", currentPlayer.getCash()));
        analysis.append(String.format("총 부채: %d\n", currentPlayer.getTotalDebt()));
        analysis.append("보유 주식:\n");
        for (int i = 1; i < currentPlayer.getStock().length; i++) {
            analysis.append(String.format("주식 %d: %d개\n", i, currentPlayer.getStock()[i]));
        }
        analysis.append(String.format("보유 금: %d개\n", currentPlayer.getGoldOwned()));

        return analysis.toString();
    }

    private String getGameRules() {
        return "1. 게임은 총 10라운드로 진행됩니다.\n" +
                "2. 각 라운드마다 주식 거래, 금 구매, 대출 등의 활동을 할 수 있어요.\n" +
                "3. 금리와 경제 이벤트에 주의해야 해요. 이들은 주식 가격과 대출 이자에 영향을 줍니다.\n" +
                "4. 금는 안전 자산으로, 가격이 천천히 상승해요.\n" +
                "5. 마지막 라운드에는 모든 자산의 가치를 합산해 순위를 매깁니다.\n" +
                "6. 현금, 주식, 금의 가치에서 부채를 뺀 순자산이 가장 높은 플레이어가 승리합니다!";
    }

    private String buildRequestBody(String prompt) {
        try {
            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("model", "claude-3-sonnet-20240229"); // 똑똑하지만 비싼놈
//            requestMap.put("model", "claude-3-haiku-20240307");
            requestMap.put("max_tokens", 300);
            requestMap.put("messages", Collections.singletonList(
                    Map.of("role", "user", "content", prompt)
            ));
            return objectMapper.writeValueAsString(requestMap);
        } catch (JsonProcessingException e) {
            logger.error("응답 생성에 실패했습니다.", e);
            return "{}";
        }
    }

    private String extractResponseContent(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            return rootNode.path("content").get(0).path("text").asText();
        } catch (JsonProcessingException e) {
            logger.error("API응답 파싱에 문제가 발생했습니다.", e);
            return "어머, 제가 말씀을 제대로 못 드린 것 같아요. 다시 한 번 물어봐 주시겠어요? 제가 더 잘 대답해 드릴게요!";
        }
    }

    // 기본 응답 준비용
    private String getFallbackResponse(String userMessage) {
        List<String> responses = new ArrayList<>();

        userMessage = userMessage.toLowerCase(); // 소문자 변환은 한 번만 수행

        if (userMessage.contains("전략") || userMessage.contains("어떻게")) {
            responses.addAll(List.of(
                    "호호호~ 꼬마 요정아! 산타모자, 크리스마스 사탕, 장난감 블록을 골고루 만들어보는 건 어때? 때론 산타모자가 인기 있고, 때론 사탕이 잘 팔릴 수 있어. 다양하게 준비하는 게 비결이야!",
                    "징글징글~ 우리 가게엔 세 가지 특별한 아이템이 있단다. 산타모자는 따뜻하고, 크리스마스 사탕은 달콤하고, 장난감 블록은 재미있어. 어떤 게 제일 좋을지 한번 만들어보면서 결정해봐!",
                    "크럼블크럼블~ 금색 사탕은 특별해서 항상 인기 있지만, 산타모자, 크리스마스 사탕, 장난감 블록도 각자의 매력이 있어. 균형 있게 만들어보는 게 어때?"
            ));
        } else if (userMessage.contains("주식") || userMessage.contains("투자")) {
            responses.addAll(List.of(
                    "반짝반짝~ 주식은 마법의 사탕 기계야. 산타모자 맛은 따뜻하고, 크리스마스 사탕 맛은 달콤하고, 장난감 블록 맛은 재미있어. 어떤 맛을 만들어볼까?",
                    "아삭아삭~ 투자는 크리스마스 트리 꾸미기 같아. 산타모자 장식, 사탕 오너먼트, 장난감 블록... 어떤 장식이 가장 인기 있을지 생각해보며 꾸며봐!"
            ));
        } else if (userMessage.contains("장난감")) {
            responses.addAll(List.of(
                    "딸랑딸랑~ 장난감 블록은 크리스마스 선물 같아. 어떤 모양으로 만들어질지 모르는 게 재미있지만, 때론 어려울 수 있어. 상상력을 발휘해서 즐겁게 만들어봐!",
                    "짠짠~ 장난감 블록은 항상 어린이들에게 인기 있어. 하지만 새로운 장난감이 나오면 인기가 바뀔 수 있으니 항상 주의 깊게 살펴봐야 해!"
            ));
        } else if (userMessage.contains("사탕") || userMessage.contains("캔디")) {
            responses.addAll(List.of(
                    "달콤달콤~ 크리스마스 사탕은 무지개 같아. 여러 가지 색깔과 맛이 있어서 선택하기 어려울 수 있지만, 그만큼 재미있지!",
                    "사르르~ 크리스마스 사탕은 계절마다 인기가 달라질 수 있어. 크리스마스엔 특히 인기 있지만, 다른 계절에도 맛있게 만들 수 있으니 잘 생각해봐!"
            ));
        } else if (userMessage.contains("산타모자") || userMessage.contains("산타양말")) {
            responses.addAll(List.of(
                    "징글벨~ 산타모자와 양말은 크리스마스 정신 같아. 연말에 가까워질수록 반짝반짝 빛나지만, 다른 계절엔 조용할 수 있어. 타이밍이 중요해!",
                    "따끈따끈~ 산타모자는 마음을 따뜻하게 해줘. 사람들의 마음이 따뜻해질 때 이 아이템의 가치가 올라간단다. 세상의 온도를 잘 살펴봐!"
            ));
        } else {
            responses.addAll(List.of(
                    "크럼블 크럼블~ 미안해 꼬마 요정, 지금은 그 질문에 대한 특별한 레시피가 생각나지 않아. 하지만 걱정마! 산타모자, 크리스마스 사탕, 장난감 블록을 계속 만들다 보면 놀라운 아이디어를 발견하게 될 거야. 넌 이미 훌륭한 크리스마스 요정이야!",
                    "징글징글~ 어떤 질문인지 정확히 알 수 없지만, 넌 정말 궁금한 게 많구나! 그 호기심으로 분명 멋진 산타모자, 맛있는 크리스마스 사탕, 재미있는 장난감 블록을 만들 수 있을 거야. 계속 즐겁게 게임을 즐기면서 새로운 것을 발견해봐!"
            ));
        }

        return responses.get(new Random().nextInt(responses.size()));
    }
}
