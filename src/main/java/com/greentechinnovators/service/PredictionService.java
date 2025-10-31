package com.greentechinnovators.service;

import com.greentechinnovators.dto.PredictionDto;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.mappers.PredictionMapper;
import com.greentechinnovators.repository.CityRepository;
import com.greentechinnovators.repository.PredictionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final CityRepository cityRepository;
    private final CityService cityService;
    public PredictionService(PredictionRepository predictionRepository, CityRepository cityRepository, CityService cityService) {
        this.predictionRepository = predictionRepository;
        this.cityRepository = cityRepository;
        this.cityService = cityService;
    }

    // 🔹 Get all predictions
    public List<Prediction> getAllPredictions() {
        return predictionRepository.findAll();
    }

    // 🔹 Get prediction by ID
    public Optional<Prediction> getPredictionById(String id) {
        return predictionRepository.findById(id);
    }

    public PredictionDto createPrediction(PredictionDto dto) {
        City city = cityService.createCity(dto.getCity());
        Prediction prediction = PredictionMapper.toEntity(dto, city);
        Prediction savedPrediction = predictionRepository.save(prediction);
        return PredictionMapper.toDto(savedPrediction);
    }


    // 🔹 Update existing prediction
    public Prediction updatePrediction(String id, PredictionDto dto) {
        Prediction existingPrediction = predictionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prediction not found with id: " + id));

        City city = cityService.createCity(dto.getCity());

        existingPrediction.setDate(dto.getDate());
        existingPrediction.setDay(dto.getDay());
        existingPrediction.setCity(city);
        existingPrediction.setPredictionTitle(dto.getPredictionTitle());
        existingPrediction.setConfidence(dto.getConfidence());
        existingPrediction.setPredictionStatus(dto.getPredictionStatus());

        return predictionRepository.save(existingPrediction);
    }
    // 🔹 Delete prediction by ID
    public void deletePrediction(String id) {
        predictionRepository.deleteById(id);
    }

    // 🔹 Delete all predictions
    public void deleteAllPredictions() {
        predictionRepository.deleteAll();
    }
}
