package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.PredictionDto;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.mappers.PredictionMapper;
import com.greentechinnovators.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/predictions")

public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    // 🔹 GET all predictions
    @GetMapping
    public ResponseEntity<List<PredictionDto>> getAllPredictions() {
        List<Prediction> predictions = predictionService.getAllPredictions();
        List<PredictionDto> predictionDtos = predictions.stream()
                .map(PredictionMapper::toDto)
                .toList();
        return ResponseEntity.ok(predictionDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PredictionDto> getPredictionById(@PathVariable String id) {
        return predictionService.getPredictionById(id)
                .map(prediction -> ResponseEntity.ok(PredictionMapper.toDto(prediction)))
                .orElse(ResponseEntity.notFound().build());
    }


    // 🔹 CREATE a new prediction
    @PostMapping
    public ResponseEntity<List<PredictionDto>> createPredictions(@RequestBody List<PredictionDto> predictionDtos) {
        List<PredictionDto> created = predictionDtos.stream()
                .map(predictionService::createPrediction)
                .collect(Collectors.toList());
        return ResponseEntity.ok(created);
    }


    // 🔹 UPDATE an existing prediction
    @PutMapping("/{id}")
    public ResponseEntity<PredictionDto> updatePrediction(
            @PathVariable String id,
            @RequestBody PredictionDto updatedPrediction
    ) {
        Prediction updated = predictionService.updatePrediction(id, updatedPrediction);
        return ResponseEntity.ok(PredictionMapper.toDto(updated));
    }

    // 🔹 DELETE a prediction
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrediction(@PathVariable String id) {
        predictionService.deletePrediction(id);
        return ResponseEntity.noContent().build();
    }
}
