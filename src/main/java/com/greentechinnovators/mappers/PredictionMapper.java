package com.greentechinnovators.mappers;

import com.greentechinnovators.dto.PredictionDto;
import com.greentechinnovators.entity.Prediction;
import org.springframework.stereotype.Component;

@Component
public class PredictionMapper {

    public static PredictionDto toDto(Prediction prediction) {
        if (prediction == null) return null;

        PredictionDto dto = new PredictionDto();
        dto.setId(prediction.getId());
        dto.setCityId(prediction.getCity() != null ? prediction.getCity().getId() : null);
        dto.setStationId(prediction.getStation() != null ? prediction.getStation().getId() : null);
        dto.setPredictionStatus(prediction.getPredictionStatus());
        dto.setPrecision(prediction.getPrecision());
        return dto;
    }

    public static Prediction toEntity(PredictionDto dto) {
        if (dto == null) return null;

        Prediction prediction = new Prediction();
        prediction.setId(dto.getId());
        prediction.setPredictionStatus(dto.getPredictionStatus());
        prediction.setPrecision(dto.getPrecision());
        // City and Station are set by the service layer
        return prediction;
    }
}
