package com.greentechinnovators.entity;

import com.greentechinnovators.enums.PredictionStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "predictions")
public class Prediction {

    @Id
    private String id;

    @DBRef(lazy = true)
    private City city;

    @DBRef(lazy = true)
    private Station station;

    private PredictionStatus predictionStatus;
    private Integer precision;
}
