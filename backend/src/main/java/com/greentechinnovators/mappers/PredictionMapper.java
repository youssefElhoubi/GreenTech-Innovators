package com.greentechinnovators.mappers;

import com.greentechinnovators.dto.PredictionDto;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.entity.Prediction;
import org.springframework.stereotype.Component;

@Component
public class PredictionMapper {

    public static PredictionDto toDto(Prediction prediction) {
        if (prediction == null) return null;

        PredictionDto dto = new PredictionDto();
        dto.setId(prediction.getId());
        dto.setDate(prediction.getDate());
        dto.setDay(prediction.getDay());
        dto.setCity(prediction.getCity() != null ? prediction.getCity().getName() : null);
        dto.setPredictionTitle(prediction.getPredictionTitle());
        dto.setConfidence(prediction.getConfidence());
        dto.setPredictionStatus(prediction.getPredictionStatus());
        return dto;
    }

    public static Prediction toEntity(PredictionDto dto, City city) {
        if (dto == null) return null;

        Prediction prediction = new Prediction();
        prediction.setId(dto.getId());
        prediction.setDate(dto.getDate());
        prediction.setDay(dto.getDay());
        prediction.setCity(city);
        prediction.setPredictionTitle(dto.getPredictionTitle());
        prediction.setConfidence(dto.getConfidence());
        prediction.setPredictionStatus(dto.getPredictionStatus());
        return prediction;
    }
}
