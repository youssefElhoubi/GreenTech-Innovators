package com.greentechinnovators.service;

import com.greentechinnovators.entity.Data;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.repository.DataRepository;
import com.greentechinnovators.repository.PredictionRepository;
import com.greentechinnovators.repository.StationRepository;
import com.greentechinnovators.dto.WeeklyReportDto;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class WeeklyReportService {

    private final DataRepository dataRepository;
    private final PredictionRepository predictionRepository;
    private final StationRepository stationRepository;

    public WeeklyReportService(DataRepository dataRepository,
                               PredictionRepository predictionRepository,
                               StationRepository stationRepository) {
        this.dataRepository = dataRepository;
        this.predictionRepository = predictionRepository;
        this.stationRepository = stationRepository;
    }

    public Map<String, Object> generateReportData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime twoWeeksAgo = now.minusDays(14);

        List<Data> thisWeekData = dataRepository.findByTimestampBetween(weekAgo, now);
        List<Data> lastWeekData = dataRepository.findByTimestampBetween(twoWeeksAgo, weekAgo);
        List<Prediction> allPredictions = predictionRepository.findAll();
        List<Station> stations = stationRepository.findAll();

        Map<String, List<Data>> thisWeekByCity = new HashMap<>();
        Map<String, List<Data>> lastWeekByCity = new HashMap<>();
        Map<String, List<Prediction>> predictionsByCity = new HashMap<>();

        for (Station s : stations) {
            String cityName = s.getCity() != null ? s.getCity().getName() : "Unknown";

            thisWeekByCity.putIfAbsent(cityName, new ArrayList<>());
            lastWeekByCity.putIfAbsent(cityName, new ArrayList<>());
            predictionsByCity.putIfAbsent(cityName, new ArrayList<>());

            if (s.getData() != null) {
                for (Data d : s.getData()) {
                    if (!d.getTimestamp().isBefore(weekAgo)) {
                        thisWeekByCity.get(cityName).add(d);
                    } else if (!d.getTimestamp().isBefore(twoWeeksAgo) && d.getTimestamp().isBefore(weekAgo)) {
                        lastWeekByCity.get(cityName).add(d);
                    }
                }
            }
        }

        for (Prediction p : allPredictions) {
            String cityName = p.getCity() != null ? p.getCity().getName() : "Unknown";
            predictionsByCity.computeIfAbsent(cityName, k -> new ArrayList<>());
            if (!p.getDate().isBefore(weekAgo.toLocalDate())) {
                predictionsByCity.get(cityName).add(p);
            }
        }

        List<Map<String, Object>> cities = new ArrayList<>();

        for (String city : thisWeekByCity.keySet()) {
            List<Data> cityThisWeek = thisWeekByCity.getOrDefault(city, Collections.emptyList());
            List<Data> cityLastWeek = lastWeekByCity.getOrDefault(city, Collections.emptyList());
            List<Prediction> cityPred = predictionsByCity.getOrDefault(city, Collections.emptyList());

            double tempAvg = cityThisWeek.stream().mapToDouble(d -> d.getTemp() != null ? d.getTemp() : 0).average().orElse(0);
            double humidityAvg = cityThisWeek.stream().mapToDouble(d -> d.getHumidity() != null ? d.getHumidity() : 0).average().orElse(0);

            double aqiThisWeek = cityThisWeek.stream()
                    .mapToDouble(d -> ((d.getCo2() != null ? d.getCo2() : 0) * 0.4
                            + (d.getGas() != null ? d.getGas() : 0) * 0.3
                            + (d.getUv() != null ? d.getUv() : 0) * 0.3))
                    .average().orElse(0);

            double aqiLastWeek = cityLastWeek.stream()
                    .mapToDouble(d -> ((d.getCo2() != null ? d.getCo2() : 0) * 0.4
                            + (d.getGas() != null ? d.getGas() : 0) * 0.3
                            + (d.getUv() != null ? d.getUv() : 0) * 0.3))
                    .average().orElse(aqiThisWeek);

            String evolution = String.format("%.1f%%", ((aqiThisWeek - aqiLastWeek) / (aqiLastWeek == 0 ? 1 : aqiLastWeek)) * 100);

            int alertesRouges = (int) cityPred.stream().filter(p -> p.getPredictionStatus() != null && p.getPredictionStatus().name().equals("RED")).count();
            int avertissementsJaunes = (int) cityPred.stream().filter(p -> p.getPredictionStatus() != null && p.getPredictionStatus().name().equals("YELLOW")).count();

            int stationsActive = (int) stations.stream()
                    .filter(s -> s.getCity() != null && s.getCity().getName().equals(city) && s.getData() != null && !s.getData().isEmpty())
                    .count();

            String alertColor = aqiThisWeek >= 100 ? "RED" : aqiThisWeek >= 50 ? "YELLOW" : "GREEN";

            Map<String, Object> cityData = new HashMap<>();
            cityData.put("name", city);
            cityData.put("aqiMoyen", aqiThisWeek);
            cityData.put("evolution", evolution);
            cityData.put("alertesRouges", alertesRouges);
            cityData.put("avertissementsJaunes", avertissementsJaunes);
            cityData.put("tempMoyen", tempAvg);
            cityData.put("humidityMoyen", humidityAvg);
            cityData.put("stationsActives", stationsActive);
            cityData.put("alertColor", alertColor);

            cities.add(cityData);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("date", now.toLocalDate().toString());
        report.put("cities", cities);

        return report;
    }

    public Path generateCsvReport() {
        try {
            Map<String, Object> reportData = generateReportData(); // Map<String, Object>
            if (reportData.isEmpty()) return null;

            List<Map<String, Object>> cities = (List<Map<String, Object>>) reportData.get("cities");
            if (cities == null || cities.isEmpty()) return null;

            Path reportPath = Path.of("reports/weekly-report-" + LocalDate.now() + ".csv");
            Files.createDirectories(reportPath.getParent());

            try (FileWriter writer = new FileWriter(reportPath.toFile())) {
                writer.write("Date,City,AQIMoyen,Evolution,AlertesRouges,AvertissementsJaunes,TempMoyen,HumidityMoyen,StationsActives,AlertColor\n");

                String reportDate = (String) reportData.get("date");

                for (Map<String, Object> cityData : cities) {
                    writer.write(String.format("%s,%s,%.2f,%s,%d,%d,%.2f,%.2f,%d,%s\n",
                            reportDate,
                            cityData.get("name"),
                            ((Number) cityData.get("aqiMoyen")).doubleValue(),
                            cityData.get("evolution"),
                            ((Number) cityData.get("alertesRouges")).intValue(),
                            ((Number) cityData.get("avertissementsJaunes")).intValue(),
                            ((Number) cityData.get("tempMoyen")).doubleValue(),
                            ((Number) cityData.get("humidityMoyen")).doubleValue(),
                            ((Number) cityData.get("stationsActives")).intValue(),
                            cityData.get("alertColor")
                    ));
                }
            }

            System.out.println("✅ Weekly CSV report generated: " + reportPath.toAbsolutePath());
            return reportPath;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
