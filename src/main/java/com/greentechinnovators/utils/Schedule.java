package com.greentechinnovators.utils;

import com.greentechinnovators.controllers.VertexAiController;
import com.greentechinnovators.entity.Prediction;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class Schedule {
    @Scheduled(cron = "0 0 3 * * 5")
    public void run(){
        VertexAiController forecastDay = new VertexAiController();
        List<VertexAiController.ForecastDay> forcast = forecastDay.parseCachedForecast() ;
//        forcast.stream().map(f ->)
    }
}
