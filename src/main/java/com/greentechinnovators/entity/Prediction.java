package com.greentechinnovators.entity;

import com.greentechinnovators.enums.PredictionStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Getter
@Setter
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

}
