package com.ssafy.omg.domain.chat.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.arena.entity.Arena;
import com.ssafy.omg.domain.game.GameRepository;
import com.ssafy.omg.domain.player.entity.Player;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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

        String prompt = buildPrompt(arena, userMessage);
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
                    return Mono.just("죄송합니다. 현재 API 오류로 응답을 생성하는 데 문제가 있습니다. 잠시 후 다시 시도해 주세요.");
                })
                .onErrorResume(Exception.class, e -> {
                    log.error("Unexpected error", e);
                    return Mono.just("예기치 않은 오류가 발생했습니다. 관리자에게 문의해 주세요.");
                });
    }

    private String buildPrompt(Arena arena, String userMessage) {
        return String.format(
                "You are an AI assistant for the game OMG. " +
                        "Current game status: %s, Round: %d, Players: %s. " +
                        "User query: %s " +
                        "Please respond in Korean.",
                arena.getGame().getGameStatus(),
                arena.getGame().getRound(),
                arena.getGame().getPlayers().toString(),
                userMessage
        );
    }

    private String buildRequestBody(String prompt) {
        try {
            Map<String, Object> requestMap = new HashMap<>();
//            requestMap.put("model", "claude-3-sonnet-20240229"); // 똑똑하지만 비싼놈
            requestMap.put("model", "claude-3-haiku-20240307");
            requestMap.put("max_tokens", 200);
            requestMap.put("messages", Collections.singletonList(
                    Map.of("role", "user", "content", prompt)
            ));
            return objectMapper.writeValueAsString(requestMap);
        } catch (JsonProcessingException e) {
            logger.error("Failed to build request body", e);
            return "{}";
        }
    }

    private String extractResponseContent(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            return rootNode.path("content").get(0).path("text").asText();
        } catch (JsonProcessingException e) {
            logger.error("API응답 파싱에 문제가 발생했습니다.", e);
            return "응답을 처리하는 데 문제가 발생했습니다.";
        }
    }

    // 기본 응답 준비용
    private String getFallbackResponse(String userMessage) {
        // 간단한 키워드 기반
        if (userMessage.contains("전략")) {
            return "현재 게임 상황을 잘 파악하고, 다른 플레이어들의 행동을 주의 깊게 관찰하세요. 적절한 타이밍에 공격적으로 플레이하되, 리스크 관리도 중요합니다.";
        } else if (userMessage.contains("규칙")) {
            return "OMG 게임의 기본 규칙은 각 라운드마다 주어진 미션을 수행하며 점수를 얻는 것입니다. 자세한 규칙은 게임 내 도움말을 참조해주세요.";
        } else {
            return "죄송합니다. 현재 상세한 답변을 드리기 어려운 상황입니다. 게임을 계속 즐겨주시기 바랍니다!";
        }
    }
}
