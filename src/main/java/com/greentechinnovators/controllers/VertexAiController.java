package com.greentechinnovators.controllers;

import com.greentechinnovators.service.VertexAiService;

import java.util.List;

import org.checkerframework.checker.units.qual.t;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.greentechinnovators.entity.Data;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.greentechinnovators.service.DataService;

// Marks this class as a REST API controller
@RestController
@RequestMapping("/api/vertex")
public class VertexAiController {

    private final VertexAiService vertexAiService;

    private final DataService dataService;
    private final ObjectMapper objectMapper;

    // ✅ Constructor-based injection (cleaner and test-friendly)
    @Autowired
    public VertexAiController(VertexAiService vertexAiService , DataService dataService, ObjectMapper objectMapper) {
        this.vertexAiService = vertexAiService;
        this.dataService = dataService;
        this.objectMapper = objectMapper;
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


@GetMapping(value = "/forecast", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAiForecast() {
        try {
            List<Data> recentData = dataService.latest10(); 
            String dataContext = objectMapper.writeValueAsString(recentData);

            String currentDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);

            String systemPrompt = "You are an expert environmental data analyst for Morocco. " +
                    "Your task is to analyze the provided *real-time sensor data* and generate a 7-day forecast *starting from the current date provided*. " +
                    "Respond ONLY with a valid JSON array (`[...]`) in French. " +
                    "Each object must match this format: " +
                    "{ \"day\": \"string\", \"date\": \"string\", \"city\": \"string\", \"predictionTitle\": \"string\", \"eventType\": \"string\", \"confidence\": \"string\" }. " +
                    "'eventType' must be one of: 'normal', 'warning', 'critical'. " +
                    "**Crucial: The dates in your response must be accurate and sequential, starting from the provided current date.**";

            String userPrompt = String.format(
                    "**Today's date is %s.** " +
                    "Here is the *latest* real-time sensor data from ESP32 devices (device: 'ESP32'): %s. " +
                    "Based *heavily* on this data (especially high co2, gas, temp values), generate a realistic 7-day forecast " +
                    "for Casablanca, Rabat, and Marrakech, *starting from today's date (%s)*.",
                    currentDate,
                    dataContext,
                    currentDate
            );

            String result = vertexAiService.ask(systemPrompt, userPrompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            return new ResponseEntity<>(result, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            String errorJson = String.format("{\"error\": \"Failed to generate forecast: %s\"}", e.getMessage());
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
