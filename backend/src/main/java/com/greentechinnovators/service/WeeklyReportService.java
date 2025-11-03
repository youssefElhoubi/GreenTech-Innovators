package com.greentechinnovators.service;

import com.greentechinnovators.entity.Data;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.repository.DataRepository;
import com.greentechinnovators.repository.PredictionRepository;
import com.greentechinnovators.repository.StationRepository;
import org.springframework.stereotype.Service;
// Pour la manipulation de fichiers
import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;

// Pour l'encodage UTF-8
import java.nio.charset.StandardCharsets;

// Pour les chemins et création de dossiers
import java.nio.file.Files;
import java.nio.file.Path;

// Pour les dates
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Pour les collections
import java.util.List;
import java.util.Map;
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

    // Génère les données du rapport
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
            // Récupération et validation des données
            Map<String, Object> reportData = generateReportData();
            if (reportData == null || reportData.isEmpty()) {
                System.err.println("⚠️ Aucune donnée de rapport disponible");
                return null;
            }

            List<Map<String, Object>> cities = (List<Map<String, Object>>) reportData.get("cities");
            if (cities == null || cities.isEmpty()) {
                System.err.println("⚠️ Aucune donnée de ville disponible");
                return null;
            }

            // Création du fichier CSV avec timestamp
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            Path reportPath = Path.of("reports/weekly-report-" + timestamp + ".csv");
            Files.createDirectories(reportPath.getParent());

            // Génération du CSV avec encodage UTF-8
            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(new FileOutputStream(reportPath.toFile()), StandardCharsets.UTF_8))) {

                // ===== EN-TÊTE DU RAPPORT =====
                writer.write("========================================\n");
                writer.write("WEEKLY ENVIRONMENT REPORT\n");
                writer.write("========================================\n");
                writer.write("Report Date : " + reportData.get("date") + "\n");
                writer.write("Generated On : " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
                writer.write("Total Cities : " + cities.size() + "\n");
                writer.write("========================================\n\n");

                // ===== DONNÉES PAR VILLE (ligne par ligne) =====
                int cityNumber = 1;
                for (Map<String, Object> cityData : cities) {
                    writer.write("--- City #" + cityNumber + " ---\n");
                    writer.write("Date : " + reportData.get("date") + "\n");
                    writer.write("City : " + getString(cityData, "name") + "\n");
                    writer.write("AQI : " + formatNumber(cityData.get("aqiMoyen"), 2) + "\n");
                    writer.write("Evolution : " + getString(cityData, "evolution") + "\n");
                    writer.write("Red Alerts : " + formatInteger(cityData.get("alertesRouges")) + "\n");
                    writer.write("Yellow Warnings : " + formatInteger(cityData.get("avertissementsJaunes")) + "\n");
                    writer.write("Temperature (°C) : " + formatNumber(cityData.get("tempMoyen"), 1) + "\n");
                    writer.write("Humidity (%) : " + formatNumber(cityData.get("humidityMoyen"), 1) + "\n");
                    writer.write("Active Stations : " + formatInteger(cityData.get("stationsActives")) + "\n");
                    writer.write("Alert Level : " + getString(cityData, "alertColor") + "\n");
                    writer.write("\n"); // Ligne vide entre chaque ville

                    cityNumber++;
                }

                // ===== STATISTIQUES GLOBALES =====
                writer.write("========================================\n");
                writer.write("SUMMARY\n");
                writer.write("========================================\n");
                writer.write("Total Red Alerts : " + calculateTotalRedAlerts(cities) + "\n");
                writer.write("Total Yellow Warnings : " + calculateTotalYellowWarnings(cities) + "\n");
                writer.write("Average AQI : " + String.format("%.2f", calculateAverageAQI(cities)) + "\n");
                writer.write("Report Status : Complete\n");
                writer.write("========================================\n");
            }

            System.out.println("✅ CSV report generated successfully: " + reportPath.toAbsolutePath());
            return reportPath;

        } catch (IOException e) {
            System.err.println("❌ Erreur I/O lors de la génération du CSV: " + e.getMessage());
            e.printStackTrace();
            return null;
        } catch (Exception e) {
            System.err.println("❌ Erreur inattendue: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

// ===== MÉTHODES UTILITAIRES (inchangées) =====

    private String formatNumber(Object value, int decimals) {
        if (value == null) {
            return "0." + "0".repeat(decimals);
        }

        try {
            double number = ((Number) value).doubleValue();
            return String.format("%." + decimals + "f", number);
        } catch (Exception e) {
            return "0." + "0".repeat(decimals);
        }
    }

    private String formatInteger(Object value) {
        if (value == null) {
            return "0";
        }

        try {
            return String.valueOf(((Number) value).intValue());
        } catch (Exception e) {
            return "0";
        }
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : "";
    }

    private int calculateTotalRedAlerts(List<Map<String, Object>> cities) {
        return cities.stream()
                .mapToInt(city -> ((Number) city.getOrDefault("alertesRouges", 0)).intValue())
                .sum();
    }

    private int calculateTotalYellowWarnings(List<Map<String, Object>> cities) {
        return cities.stream()
                .mapToInt(city -> ((Number) city.getOrDefault("avertissementsJaunes", 0)).intValue())
                .sum();
    }

    private double calculateAverageAQI(List<Map<String, Object>> cities) {
        return cities.stream()
                .mapToDouble(city -> ((Number) city.getOrDefault("aqiMoyen", 0)).doubleValue())
                .average()
                .orElse(0.0);
    }

}
