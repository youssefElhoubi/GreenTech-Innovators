package com.greentechinnovators.controllers;

import com.greentechinnovators.service.VertexAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Marks this class as a REST API controller
@RestController
@RequestMapping("/api/vertex")
public class VertexAiController {

    private final VertexAiService vertexAiService;

    // ✅ Constructor-based injection (cleaner and test-friendly)
    @Autowired
    public VertexAiController(VertexAiService vertexAiService) {
        this.vertexAiService = vertexAiService;
    }

    /**
     * Endpoint: POST /api/vertex/ask
     * Body: { "prompt": "your question here" }
     *
     * This sends the prompt to the Vertex AI service, which then calls the external AI API.
     */
    @PostMapping(value = "/ask", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> ask(@RequestBody PromptRequest request) {
        try {
            // 🧠 Call the service to send data to the external AI API
            String result = vertexAiService.ask(request.getPrompt());

            // ✅ Return the response from the AI API directly to the client
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            return new ResponseEntity<>(result, headers, HttpStatus.OK);

        } catch (Exception e) {
            // ❗Handle unexpected errors gracefully
            e.printStackTrace();
            String errorJson = String.format("{\"error\": \"Something went wrong: %s\"}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorJson);
        }
    }

    // 📦 Simple DTO (Data Transfer Object) for request body
    public static class PromptRequest {
        private String prompt;

        public String getPrompt() {
            return prompt;
        }

        public void setPrompt(String prompt) {
            this.prompt = prompt;
        }
    }
}
