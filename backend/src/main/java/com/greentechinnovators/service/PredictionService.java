package com.greentechinnovators.service;
import com.greentechinnovators.dto.PredictionDto;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.mappers.PredictionMapper;
import com.greentechinnovators.repository.CityRepository;
import com.greentechinnovators.repository.PredictionRepository;
import com.greentechinnovators.enums.PredictionStatus;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;


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
        LocalDate today = LocalDate.now();
        LocalDate weekAhead = today.plusDays(6);

        return predictionRepository.findAll().stream()
                .filter(p -> {
                    LocalDate predictionDate = p.getDate();
                    return (predictionDate.isEqual(today) || predictionDate.isAfter(today)) &&
                            (predictionDate.isEqual(weekAhead) || predictionDate.isBefore(weekAhead));
                })
                .toList();
    }

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


    public Map<String, Object> getKPIs() {
        LocalDate today = LocalDate.now();
        LocalDate weekAhead = today.plusDays(6);

        List<Prediction> thisWeekPredictions = predictionRepository.findAll().stream().filter(p -> !p.getDate().isBefore(today) && !p.getDate().isAfter(weekAhead)).toList();
        LocalDate lastWeekStart = today.minusDays(7);
        LocalDate lastWeekEnd = today.minusDays(1);
        List<Prediction> lastWeekPredictions = predictionRepository.findAll().stream().filter(p -> !p.getDate().isBefore(lastWeekStart) && !p.getDate().isAfter(lastWeekEnd)).toList();

        long warningsThisWeek = thisWeekPredictions.stream().filter(p -> p.getPredictionStatus().equals(PredictionStatus.WARNING)).count();
        long warningsLastWeek = lastWeekPredictions.stream().filter(p -> p.getPredictionStatus().equals(PredictionStatus.WARNING)).count();
        long warningsDiff = warningsThisWeek - warningsLastWeek;

        long criticalThisWeek = thisWeekPredictions.stream().filter(p -> p.getPredictionStatus().equals(PredictionStatus.DANGER)).count();
        long criticalLastWeek = lastWeekPredictions.stream().filter(p -> p.getPredictionStatus().equals(PredictionStatus.DANGER)).count();
        long criticalDiff = criticalThisWeek - criticalLastWeek;

        double avgConfidenceThisWeek = thisWeekPredictions.stream().mapToInt(p -> p.getConfidence() != null ? p.getConfidence() : 0).average().orElse(0.0);

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDate firstDayOfLastMonth = firstDayOfMonth.minusMonths(1);
        LocalDate lastDayOfLastMonth = firstDayOfMonth.minusDays(1);

        List<Prediction> thisMonthPredictions = predictionRepository.findAll().stream().filter(p -> !p.getDate().isBefore(firstDayOfMonth) && !p.getDate().isAfter(today)).toList();
        List<Prediction> lastMonthPredictions = predictionRepository.findAll().stream().filter(p -> !p.getDate().isBefore(firstDayOfLastMonth) && !p.getDate().isAfter(lastDayOfLastMonth)).toList();
        double avgConfidenceThisMonth = thisMonthPredictions.stream().mapToInt(p -> p.getConfidence() != null ? p.getConfidence() : 0).average().orElse(0.0);
        double avgConfidenceLastMonth = lastMonthPredictions.stream().mapToInt(p -> p.getConfidence() != null ? p.getConfidence() : 0).average().orElse(0.0);
        double confidenceDiff = avgConfidenceThisMonth - avgConfidenceLastMonth;

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("criticalAlerts", criticalThisWeek);
        kpis.put("criticalDiff", criticalDiff);
        kpis.put("warnings", warningsThisWeek);
        kpis.put("warningsDiff", warningsDiff);
        kpis.put("accuracy", avgConfidenceThisWeek);
        kpis.put("accuracyDiff", confidenceDiff);
        kpis.put("predictions", thisWeekPredictions.size());

        return kpis;
    }

    public List<Double> getWeeklyAccuracy() {
        List<Prediction> allPredictions = predictionRepository.findAll();

        if (allPredictions.isEmpty()) return new ArrayList<>();

        LocalDate firstPredictionDate = allPredictions.stream()
                .map(Prediction::getDate)
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());

        LocalDate today = LocalDate.now();
        List<Double> weeklyAccuracy = new ArrayList<>();

        for (LocalDate start = firstPredictionDate.with(DayOfWeek.MONDAY); !start.isAfter(today); start = start.plusWeeks(1)) {
            LocalDate endOfWeek = start.plusDays(6);

            LocalDate finalStart = start;
            LocalDate finalEnd = endOfWeek;

            List<Prediction> weekPredictions = allPredictions.stream()
                    .filter(p -> !p.getDate().isBefore(finalStart) && !p.getDate().isAfter(finalEnd))
                    .toList();

            double avg = weekPredictions.stream()
                    .mapToInt(p -> p.getConfidence() != null ? p.getConfidence() : 0)
                    .average()
                    .orElse(0.0);

            weeklyAccuracy.add(avg);
        }

        return weeklyAccuracy;
    }



}
