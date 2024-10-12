package com.ssafy.omg.domain.chat.service;

import com.ssafy.omg.config.baseresponse.BaseException;
import reactor.core.publisher.Mono;

public interface ChatbotService {
    Mono<String> getChatbotResponse(String roomId, String userNickname, String userMessage) throws BaseException;

}
