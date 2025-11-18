package com.greentechinnovators.utils;

import com.greentechinnovators.controllers.VertexAiController;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.enums.PredictionStatus;
import com.greentechinnovators.mappers.PredictionMapper;
import com.greentechinnovators.repository.CityRepository;
import com.greentechinnovators.service.PredictionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
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
    private ObjectMapper objectMapper;
    @Autowired
    private com.greentechinnovators.service.VertexAiService vertexAiService;

    // (Runs every minute for testing)
   @Scheduled(cron = "0 0 * * * *")
    public void run() {
        System.out.println("Scheduler: Starting scheduled forecast fetching process for all cities...");
        
        List<City> cities = cityRepository.findAll();
        
        if (cities == null || cities.isEmpty()) {
            System.out.println("Scheduler: No cities found in database. Skipping forecast generation.");
            return;
        }
        
        System.out.println("Scheduler: Found " + cities.size() + " cities to process.");
        
        for (City city : cities) {
            try {
                System.out.println("Scheduler: Processing forecast for city: " + city.getName());
                
                String currentDate = LocalDate.now().toString();
                
                String systemPrompt = "You are an expert environmental data analyst for Morocco. " +
                        "Your task is to analyze environmental data and generate a 7-day forecast for " + city.getName() + " " +
                        "starting from " + currentDate + ". " +
                        "Respond ONLY with a valid JSON array ([...]) in French. " +
                        "Each object must follow this format: " +
                        "{ \"day\": \"string\", \"date\": \"YYYY-MM-DD\", \"city\": \"" + city.getName() + "\", " +
                        "\"predictionTitle\": \"string\", \"eventType\": \"string\", \"confidence\": 80 }. " +
                        "'eventType' must be one of: 'NORMAL', 'WARNING', 'DANGER'. " +
                        "**The dates must be accurate and sequential, starting from " + currentDate + ".**";

                String userPrompt = String.format(
                        "Generate a realistic 7-day environmental forecast for %s, Morocco, " +
                        "starting from today's date (%s). Base your predictions on typical environmental " +
                        "patterns for this city.",
                        city.getName(), currentDate
                );

                String jsonResponse = vertexAiService.ask(systemPrompt, userPrompt);

                int startIndex = jsonResponse.indexOf('[');
                int endIndex = jsonResponse.lastIndexOf(']');

                if (startIndex == -1 || endIndex == -1 || endIndex < startIndex) {
                    System.err.println("Scheduler: AI response did not contain a valid JSON array for " + city.getName() + ". Response was: " + jsonResponse);
                    continue;
                }

                String cleanJson = jsonResponse.substring(startIndex, endIndex + 1);
                System.out.println("Scheduler: Cleaned JSON response retrieved for " + city.getName());

                List<VertexAiController.ForecastDay> forecast = objectMapper.readValue(
                    cleanJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, VertexAiController.ForecastDay.class)
                );

                if (forecast == null || forecast.isEmpty()) {
                    System.out.println("Scheduler: AI returned an empty forecast for " + city.getName() + ". Skipping.");
                    continue;
                }

                List<Prediction> predictions = forecast.stream().map(f -> Prediction.builder()
                        .date(LocalDate.parse(f.getDate()))
                        .predictionStatus(PredictionStatus.valueOf(f.getEventType().toUpperCase()))
                        .predictionTitle(f.getPredictionTitle())
                        .day(f.getDay())
                        .city(city)
                        .confidence(f.getConfidence())
                        .build()
                ).toList();

                predictions.forEach(p -> predictionService.createPrediction(PredictionMapper.toDto(p)));

                System.out.println("Scheduler: Successfully saved " + predictions.size() + " forecasts for " + city.getName());

            } catch (Exception e) {
                System.err.println("Scheduler: Error processing forecast for " + city.getName() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        System.out.println("Scheduler: Finished processing all cities.");
    }
}
