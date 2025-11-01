package com.greentechinnovators.utils;

import com.greentechinnovators.controllers.VertexAiController;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.enums.PredictionStatus;
import com.greentechinnovators.mappers.PredictionMapper;
import com.greentechinnovators.repository.CityRepository;
import com.greentechinnovators.service.PredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
public class Schedule {
    @Autowired
    private CityRepository cityRepository;
    @Autowired
    private PredictionService predictionService;
    @Scheduled(cron = "0 * * * * *")
    public void run(){
        VertexAiController forecastDay = new VertexAiController();
        List<VertexAiController.ForecastDay> forecast = forecastDay.parseCachedForecast() ;
        List<Prediction> predictions = forecast.stream().map(f -> Prediction.builder()
                .date(LocalDate.parse(f.getDate()))
                .predictionStatus(PredictionStatus.valueOf(f.getEventType().toUpperCase()))
                .predictionTitle(f.getPredictionTitle())
                .day(f.getDay())
                .city(cityRepository.findByName(f.getCity()).orElse(null))
                .confidence(f.getConfidence())
                .id(UUID.randomUUID().toString())
                .build()
        ).toList();
        predictions.forEach(p -> predictionService.createPrediction(PredictionMapper.toDto(p)));
    }
}
