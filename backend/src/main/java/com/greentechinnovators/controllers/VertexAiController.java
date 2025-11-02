package com.greentechinnovators.controllers;

import com.greentechinnovators.service.VertexAiService;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.service.DataService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.Map;

@RestController
@RequestMapping("/api/vertex")
public class VertexAiController {

    private final VertexAiService vertexAiService;
    private final DataService dataService;
    private final ObjectMapper objectMapper;
    private final ExecutorService executorService;

    private final Map<String, String> forecastCache = new HashMap<>();

    @Autowired
    public VertexAiController(VertexAiService vertexAiService, DataService dataService, ObjectMapper objectMapper) {
        this.vertexAiService = vertexAiService;
        this.dataService = dataService;
        this.objectMapper = objectMapper;
        this.executorService = Executors.newCachedThreadPool();
    }

    public VertexAiController() {
        this.vertexAiService =null;
        this.dataService =null;
        this.objectMapper = new ObjectMapper();
        this.executorService =null;
    }

    /**
     *  Fast version with Streaming – the answer appears immediately.
     * GET /api/vertex/forecast-stream
     */
    @GetMapping(value = "/forecast-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter getAiForecastStream() {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minutes timeout

        StringBuilder fullResponse = new StringBuilder();

        executorService.execute(() -> {
            try {
                // Collect recent data
                List<Data> recentData = dataService.latest10();
                String dataContext = objectMapper.writeValueAsString(recentData);
                String currentDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);

                // Send a start message
                emitter.send(SseEmitter.event()
                        .name("start")
                        .data(" Connecting to the AI..."));

                String systemPrompt = "You are an expert environmental data analyst for Morocco. " +
                        "Your task is to analyze the provided *real-time sensor data* and generate a 7-day forecast *starting from the current date provided*. " +
                        "Respond ONLY with a valid JSON array (`[...]`) in English. " +
                        "Each object must follow this format: " +
                        "**confidence should be a Integer between 0 and 100.** " +
                        "{ \"day\": \"string\", \"date\": \"string\", \"city\": \"string\", \"predictionTitle\": \"string\", \"eventType\": \"string\", \"confidence\": \"string\" }. " +
                        "'eventType' must be one of: 'normal', 'warning', 'critical'. " +
                        "**Crucial: The dates in your response must be accurate and sequential, starting from the provided current date.**";

                String userPrompt = String.format(
                        "**Today's date is %s.** " +
                        "Here is the *latest* real-time sensor data from ESP32 devices (device: 'ESP32'): %s. " +
                        "Based *heavily* on this data (especially high co2, gas, temp values), generate a realistic 7-day forecast " +
                        "for Safi, *starting from today's date (%s)*.",
                        currentDate, dataContext, currentDate
                );

                //  Use the Streaming API
                vertexAiService.askStream(systemPrompt, userPrompt, chunk -> {
                    try {
                        // Accumulate chunks for caching
                        fullResponse.append(chunk);

                        emitter.send(SseEmitter.event()
                                .name("message")
                                .data(chunk));
                    } catch (IOException e) {
                        emitter.completeWithError(e);
                    }
                });

                // Cache the complete response
                String finalJsonResponse = fullResponse.toString();
                forecastCache.put("latestForecast", finalJsonResponse);

                // Send an end message
                emitter.send(SseEmitter.event()
                        .name("end")
                        .data("Finished"));

                emitter.complete();

            } catch (Exception e) {
                e.printStackTrace();
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data(" Error: " + e.getMessage()));
                } catch (IOException ex) {
                    // ignore
                }
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }


    @GetMapping("/forecast-cache")
    public ResponseEntity<String> getForecastFromCache() {
        String latestForecast = forecastCache.get("latestForecast");
        if (latestForecast == null || latestForecast.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Cache is empty. Call /forecast-stream first.\"}");
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new ResponseEntity<>(latestForecast, headers, HttpStatus.OK);
    }

    /**
     * Non-streaming version
     * GET /api/vertex/forecast
     */
    @GetMapping(value = "/forecast", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getAiForecast() {
        try {
            List<Data> recentData = dataService.latest10();
            String dataContext = objectMapper.writeValueAsString(recentData);
            String currentDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);

            String systemPrompt = "You are an expert environmental data analyst for Morocco. " +
                    "Your task is to analyze the provided *real-time sensor data* and generate a 7-day forecast *starting from the current date provided*. " +
                    "Respond ONLY with a valid JSON array (`[...]`) in French. " +
                    "Each object must follow this format: " +
                    "**confidence should be a Integer between 0 and 100.** " +
                    "{ \"day\": \"string\", \"date\": \"string\", \"city\": \"string\", \"predictionTitle\": \"string\", \"eventType\": \"string\", \"confidence\": \"string\" }. " +
                    "'eventType' must be one of: 'normal', 'warning', 'critical'. " +
                    "**Crucial: The dates in your response must be accurate and sequential, starting from the provided current date.**";

            String userPrompt = String.format(
                    "**Today's date is %s.** " +
                    "Here is the *latest* real-time sensor data from ESP32 devices (device: 'ESP32'): %s. " +
                    "Based *heavily* on this data (especially high co2, gas, temp values), generate a realistic 7-day forecast " +
                    "for Safi, *starting from today's date (%s)*.",
                    currentDate, dataContext, currentDate
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

    /**
     * POST /api/vertex/ask
     * Simple endpoint to send a custom prompt to Vertex AI
     */
    @PostMapping(value = "/ask", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> ask(@RequestBody PromptRequest request) {
        try {
            String result = vertexAiService.ask(request.getPrompt());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            return new ResponseEntity<>(result, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            String errorJson = String.format("{\"error\": \"Something went wrong: %s\"}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorJson);
        }
    }

    // Helper class for the /ask endpoint
    public static class PromptRequest {
        private String prompt;

        public String getPrompt() {
            return prompt;
        }

        public void setPrompt(String prompt) {
            this.prompt = prompt;
        }
    }
    /**
     * POST /api/vertex/generate-report
     * Simple endpoint to send a custom prompt to Vertex AI
     */

    @PostMapping("/generate-report")
    public ResponseEntity<String> generateReport() {
        try {
            List<Data> recentData = dataService.latest10();
            if (recentData == null || recentData.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body("{\"message\": \"No data available to generate report.\"}");
            }

            String dataJson = objectMapper.writeValueAsString(recentData);

            String prompt = String.format("""
                You are an environmental data analyst for Morocco.
                Based on the following recent ESP32 sensor data: %s
                Generate a JSON report for the last 7 days for Safi.
                The JSON array should contain objects like:
                {
                  "date": "YYYY-MM-DD",
                  "AQIMoyen": 0,
                  "Evolution": "+/-%",
                  "AlertesRouges": 0,
                  "AvertissementsJaunes": 0
                }.
                The report should be complete, accurate, and ready to display on a dashboard.
                Return ONLY valid JSON array, without explanations or markdown.
                """, dataJson);

            String result = vertexAiService.ask(prompt);

            if (!result.trim().startsWith("[") && !result.trim().startsWith("{")) {
                result = "{\"error\": \"Unexpected response format from AI.\"}";
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(result);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            return new ResponseEntity<>(result, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}");
        }
    }


    public static class ForecastDay {
    private String day;
    private String date;
    private String city;
    private String predictionTitle;
    private String eventType;
    private int confidence;

    // Constructors
    public ForecastDay() {}

    public ForecastDay(String day, String date, String city, String predictionTitle,
                String eventType, int confidence) {
        this.day = day;
        this.date = date;
        this.city = city;
        this.predictionTitle = predictionTitle;
        this.eventType = eventType;
        this.confidence = confidence;
    }

    // Getters and Setters
    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPredictionTitle() { return predictionTitle; }
    public void setPredictionTitle(String predictionTitle) { this.predictionTitle = predictionTitle; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public int getConfidence() { return confidence; }
    public void setConfidence(int confidence) { this.confidence = confidence; }
}

// Add this method to parse the cached forecast
public  List<ForecastDay> parseCachedForecast() {
    try {
        String cachedJson = forecastCache.get("latestForecast");
        if (cachedJson == null || cachedJson.isEmpty()) {
            return List.of(); // Return empty list if cache is empty
        }

        // Parse JSON array to List of ForecastDay objects
        List<ForecastDay> forecastDays = objectMapper.readValue(
            cachedJson,
            objectMapper.getTypeFactory().constructCollectionType(List.class, ForecastDay.class)
        );

        return forecastDays;
    } catch (Exception e) {
        e.printStackTrace();
        return List.of(); // Return empty list on error
    }
}


}