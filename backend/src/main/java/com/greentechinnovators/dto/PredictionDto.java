package com.greentechinnovators.dto;

import com.greentechinnovators.enums.PredictionStatus;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class PredictionDto {

    private String id;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Day is required")
    private String day;

    @NotBlank(message = "City name is required")
    private String city;

    @NotBlank(message = "Prediction title is required")
    private String predictionTitle;

    @NotNull(message = "Confidence is required")
    @Min(value = 0, message = "Confidence cannot be less than 0")
    @Max(value = 100, message = "Confidence cannot exceed 100")
    private Integer confidence;

    @NotNull(message = "Prediction status is required")
    private PredictionStatus predictionStatus;
}
