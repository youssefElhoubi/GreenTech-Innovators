package com.greentechinnovators.utils;

import com.greentechinnovators.controllers.VertexAiController;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.enums.PredictionStatus;
import com.greentechinnovators.mappers.PredictionMapper;
import com.greentechinnovators.repository.CityRepository;
import com.greentechinnovators.service.CityService;
import com.greentechinnovators.service.PredictionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class Schedule {

    @Autowired
    private CityRepository cityRepository;
    @Autowired
    private PredictionService predictionService;
    @Autowired
    private VertexAiController vertexAiController;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private CityService cityService;

    // (Runs every minute for testing)
    @Scheduled(cron = "0 * * * * *")
    public void run() {
        System.out.println("Scheduler: Starting scheduled forecast fetching process...");
        try {
            // Call the AI forecast function
            ResponseEntity<String> response = vertexAiController.getAiForecast();

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                System.err.println("Scheduler: Failed to fetch forecasts from AI. Response: " + response.getBody());
                return;
            }

            String jsonResponse = response.getBody();

            // Clean the response (remove Markdown backticks ```)

            int startIndex = jsonResponse.indexOf('[');
            int endIndex = jsonResponse.lastIndexOf(']');

            if (startIndex == -1 || endIndex == -1 || endIndex < startIndex) {
                System.err.println("Scheduler: AI response did not contain a valid JSON array []. Response was: " + jsonResponse);
                return;
            }

            // Extract only the clean JSON array
            String cleanJson = jsonResponse.substring(startIndex, endIndex + 1);
            System.out.println("Scheduler: Cleaned JSON response retrieved.");

            // Parse the clean JSON
            List<VertexAiController.ForecastDay> forecast = objectMapper.readValue(
                cleanJson,
                objectMapper.getTypeFactory().constructCollectionType(List.class, VertexAiController.ForecastDay.class)
            );

            if (forecast == null || forecast.isEmpty()) {
                System.out.println("Scheduler: AI returned an empty forecast. Skipping.");
                return;
            }

            com.greentechinnovators.entity.City safiCity = cityRepository.findByName("Safi")
                    .orElseGet(() -> cityService.createCity("Safi"));

            List<Prediction> predictions = forecast.stream().map(f -> Prediction.builder()
                    .date(LocalDate.parse(f.getDate()))
                    .predictionStatus(PredictionStatus.valueOf(f.getEventType().toUpperCase()))
                    .predictionTitle(f.getPredictionTitle())
                    .day(f.getDay())
                    .city(safiCity)
                    .confidence(f.getConfidence())
                    .build()
            ).toList();

            //  Use the updated function to save data
            predictions.forEach(p -> predictionService.createPrediction(PredictionMapper.toDto(p)));

            System.out.println("Scheduler: Successfully saved/updated " + predictions.size() + " forecasts in the database.");

        } catch (Exception e) {
            System.err.println("Scheduler: An error occurred while fetching/saving forecasts.");
            e.printStackTrace();
        }
    }
}
