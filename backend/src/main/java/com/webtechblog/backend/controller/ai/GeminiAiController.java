package com.webtechblog.backend.controller.ai;

import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
public class GeminiAiController {

    private final ChatModel chatModel;

    public GeminiAiController(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    @GetMapping("/{message}")
    public ResponseEntity<?> getMessage(@PathVariable String message) {

        try {

            var response = chatModel.call(
                    new Prompt(
                            new UserMessage(message)
                    )
            );

            return ResponseEntity.ok(
                    response.getResult().getOutput().getText()
            );

        } catch (Exception e) {

            Throwable t = e;

            while (t.getCause() != null) {
                t = t.getCause();
            }

            t.printStackTrace();

            return ResponseEntity.badRequest().body(t.getMessage());
        }

    }

}