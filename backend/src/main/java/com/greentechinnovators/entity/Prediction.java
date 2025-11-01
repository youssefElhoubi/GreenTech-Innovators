package com.greentechinnovators.entity;

import com.greentechinnovators.enums.PredictionStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@Document(collection = "predictions")
public class Prediction {

    @Id
    private String id;
    private LocalDate date;
    private String day;
    @DBRef(lazy = true)
    private City city;
    private String predictionTitle;
    private Integer confidence;
    private PredictionStatus predictionStatus;

    public Prediction(String id, LocalDate date, String day, City city, String predictionTitle, Integer confidence, PredictionStatus predictionStatus) {
        this.id = id;
        this.date = date;
        this.day = day;
        this.city = city;
        this.predictionTitle = predictionTitle;
        this.confidence = confidence;
        this.predictionStatus = predictionStatus;
    }

    public Prediction() {
    }
}
