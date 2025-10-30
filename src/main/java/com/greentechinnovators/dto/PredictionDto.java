package com.greentechinnovators.dto;

import com.greentechinnovators.entity.City;
import com.greentechinnovators.enums.PredictionStatus;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PredictionDto {

    private String id;

    @NotNull(message = "City ID is required")
    private String cityId;

    @NotNull(message = "Station ID is required")
    private String stationId;

    @NotNull(message = "Prediction status is required")
    private PredictionStatus predictionStatus;

    @NotNull(message = "Precision is required")
    @Min(value = 0, message = "Precision cannot be less than 0")
    @Max(value = 100, message = "Precision cannot exceed 100")
    private Integer precision;

    public PredictionDto(String id, String cityId, String stationId, PredictionStatus predictionStatus, Integer precision) {
        this.id = id;
        this.cityId = cityId;
        this.stationId = stationId;
        this.predictionStatus = predictionStatus;
        this.precision = precision;
    }

    public PredictionDto() {
    }

}
