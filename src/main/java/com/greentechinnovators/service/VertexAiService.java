package com.greentechinnovators.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.DefaultUriBuilderFactory;

import java.util.HashMap;
import java.util.Map;

@Service
public class VertexAiService {

    private String apiKey;

    private String apiUrl;

    private final RestTemplate restTemplate;

    public VertexAiService(
            @Value("${vertex.api.key}") String apiKey,
            @Value("${vertex.api.url}") String apiUrl
    ) {
        this.apiKey =apiKey;
        this.apiUrl =apiUrl;
        // Initialize RestTemplate
        this.restTemplate = new RestTemplate();
        // Optional: set base URL
        this.restTemplate.setUriTemplateHandler(new DefaultUriBuilderFactory(apiUrl));
    }

    /**
     * Sends the user input (promptText) to the external AI API and returns the API response as a string.
     */
    public String ask(String promptText) {
        // 🧩 Create the request body as a Map instead of manually writing JSON
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("input", promptText);

        // 🧾 Prepare headers for JSON + authentication
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        // 👉 Most APIs expect the key as a Bearer token, but your API uses ?api_key= query param.
        // If yours supports Bearer tokens, use:
        // headers.setBearerAuth(apiKey);

        // 📦 Combine headers and body
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // 🚀 Send POST request to the external API
            //     ↓↓↓ THIS is where you send data to the external API ↓↓↓
            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl + "?api_key=" + apiKey, // full URL
                    HttpMethod.POST,
                    entity,
                    String.class
            );
            // ↑↑↑ END of external API call ↑↑↑

            // ✅ Return the raw JSON response body
            return response.getBody();

        } catch (Exception e) {
            // Handle network or API errors safely
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
}
