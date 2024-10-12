package com.ssafy.omg.domain.chat.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.chat.dto.ChatMessage;
import com.ssafy.omg.domain.chat.service.ChatbotService;
import com.ssafy.omg.domain.socket.dto.StompPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatbotService chatbotService;

//    @MessageMapping("/chat/{roomId}")
//    public void chat(@DestinationVariable String roomId, ChatMessage chatMessage) {
//        messagingTemplate.convertAndSend("/sub/rooms/" + roomId, chatMessage);
//    }

    @MessageMapping("/{roomId}/chat")
    public void chat(@Payload StompPayload<ChatMessage> chatMessage) {
//        System.out.println("Received message: " + chatMessage); // 로그 찍어보기
        messagingTemplate.convertAndSend("/sub/" + chatMessage.getRoomId() + "/chat", chatMessage);
    }

    @PostMapping("/chatbot/response")
    public Mono<String> getResponse(@RequestParam String roomId, @RequestParam String sender, @RequestParam String message) throws BaseException {
        return chatbotService.getChatbotResponse(roomId, sender, message);
    }
}
