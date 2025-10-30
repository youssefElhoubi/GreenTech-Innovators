package com.greentechinnovators.service;

import com.greentechinnovators.dto.PredictionDto;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.mappers.PredictionMapper;
import com.greentechinnovators.repository.PredictionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;

    public PredictionService(PredictionRepository predictionRepository) {
        this.predictionRepository = predictionRepository;
    }

    // 🔹 Get all predictions
    public List<Prediction> getAllPredictions() {
        return predictionRepository.findAll();
    }

    // 🔹 Get prediction by ID
    public Optional<Prediction> getPredictionById(String id) {
        return predictionRepository.findById(id);
    }

    // 🔹 Add new prediction
    public Prediction createPrediction(PredictionDto prediction) {
        Prediction predictionEntity = PredictionMapper.toEntity(prediction);
        return predictionRepository.save(predictionEntity);
    }

    // 🔹 Update existing prediction
    public Prediction updatePrediction(String id, PredictionDto updatedPrediction) {
        predictionRepository.findById(id).orElseThrow(() -> new RuntimeException("Prediction not found with id: " + id));
        Prediction predictionEntity = PredictionMapper.toEntity(updatedPrediction);
        predictionEntity.setCity(predictionEntity.getCity());
        predictionEntity.setStation(predictionEntity.getStation());
        predictionEntity.setPredictionStatus(updatedPrediction.getPredictionStatus());
        predictionEntity.setPrecision(updatedPrediction.getPrecision());
        return predictionRepository.save(predictionEntity);

    }

    // 🔹 Delete prediction by ID
    public void deletePrediction(String id) {
        predictionRepository.deleteById(id);
    }

    // (Optional) 🔹 Delete all predictions
    public void deleteAllPredictions() {
        predictionRepository.deleteAll();
    }
}
