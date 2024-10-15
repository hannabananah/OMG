package com.ssafy.omg.domain.chat.controller;

import com.ssafy.omg.config.baseresponse.BaseException;
import com.ssafy.omg.domain.chat.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class ChatbotController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatbotService chatbotService;

    @GetMapping("/api/chatbot/response")
    public Mono<String> getResponse(@RequestParam String roomId, @RequestParam String sender, @RequestParam String message) throws BaseException {
        return chatbotService.getChatbotResponse(roomId, sender, message);
    }

//    @MessageMapping("/{roomId}/chat")
//    public void chat(@Payload StompPayload<ChatMessage> chatMessage) {
//        messagingTemplate.convertAndSend("/sub/" + chatMessage.getRoomId() + "/chat", chatMessage);
//
//        if (chatMessage.getData().getContent().startsWith("@bot")) {
//            String userMessage = chatMessage.getData().getContent().substring(5).trim();
//            chatbotService.getChatbotResponse(chatMessage.getRoomId(), userMessage)
//                    .subscribe(response -> {
//                        ChatMessage botResponse;
//                        botResponse = new ChatMessage("Chatbot", response);
//                        StompPayload<ChatMessage> botPayload = new StompPayload<>("CHAT", chatMessage.getRoomId(), "CHATBOT", botResponse);
//                        messagingTemplate.convertAndSend("/sub/" + chatMessage.getRoomId() + "/chat", botPayload);
//                    });
//        }
//    }

}
