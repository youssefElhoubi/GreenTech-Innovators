package com.greentechinnovators.controllers;

import com.greentechinnovators.service.VertexAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vertex")
public class VertexAiController {

    private final VertexAiService vertexAiService;

    @Autowired
    public VertexAiController(VertexAiService vertexAiService) {
        this.vertexAiService = vertexAiService;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestBody PromptRequest request) {
        try {
            String result = vertexAiService.ask(request.getPrompt());
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Something went wrong: " + e.getMessage() + "\"}");
        }
    }

    public static class PromptRequest {
        private String prompt;

        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }
    }
}
