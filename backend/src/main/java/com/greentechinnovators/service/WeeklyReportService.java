package com.greentechinnovators.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.entity.Prediction;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.repository.DataRepository;
import com.greentechinnovators.repository.PredictionRepository;
import com.greentechinnovators.repository.StationRepository;
import com.itextpdf.layout.element.Text;
import org.springframework.stereotype.Service;
import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;

import java.nio.charset.StandardCharsets;

import java.nio.file.Files;
import java.nio.file.Path;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

// Pour les collections
import java.util.List;
import java.util.Map;

import java.util.*;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

import com.itextpdf.layout.element.Table;

@Service
public class WeeklyReportService {

    private final DataRepository dataRepository;
    private final PredictionRepository predictionRepository;
    private final StationRepository stationRepository;
    private final VertexAiService vertexAiService;
    public WeeklyReportService(DataRepository dataRepository,
                               PredictionRepository predictionRepository,
                               StationRepository stationRepository, VertexAiService vertexAiService) {
        this.dataRepository = dataRepository;
        this.predictionRepository = predictionRepository;
        this.stationRepository = stationRepository;
        this.vertexAiService = vertexAiService;
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
                    .filter(s -> s.getCity() != null
                            && s.getCity().getName() != null
                            && s.getCity().getName().equals(city)
                            && s.getData() != null
                            && !s.getData().isEmpty())
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

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            Path reportPath = Path.of("reports/weekly-report-" + timestamp + ".csv");
            Files.createDirectories(reportPath.getParent());

            try (BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(new FileOutputStream(reportPath.toFile()), StandardCharsets.UTF_8))) {

                // ===== EN-TÊTE =====
                writer.write("========================================\n");
                writer.write("WEEKLY ENVIRONMENT REPORT\n");
                writer.write("========================================\n");
                writer.write("Report Date : " + reportData.get("date") + "\n");
                writer.write("Generated On : " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
                writer.write("Total Cities : " + cities.size() + "\n");
                writer.write("========================================\n\n");

                // ===== DONNÉES PAR VILLE =====
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
                    writer.write("\n");
                    cityNumber++;
                }

                // ===== STATISTIQUES GLOBALES =====
                writer.write("========================================\n");
                writer.write("SUMMARY\n");
                writer.write("========================================\n");
                writer.write("Total Red Alerts : " + calculateTotalRedAlerts(cities) + "\n");
                writer.write("Total Yellow Warnings : " + calculateTotalYellowWarnings(cities) + "\n");
                writer.write("Average AQI : " + String.format("%.2f", calculateAverageAQI(cities)) + "\n");

                // ===== AI ANALYSIS =====
                String aiAnalysis = reportData.get("aiAnalysis") != null ? reportData.get("aiAnalysis").toString() : "No AI analysis available";
                writer.write("\n========================================\n");
                writer.write("AI ANALYSIS\n");
                writer.write("========================================\n");
                writer.write(aiAnalysis + "\n");
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


    public Path generatePdfReportWithAI(Map<String, Object> reportData) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            Path pdfPath = Path.of("reports/weekly-report-ai-" + timestamp + ".pdf");
            Files.createDirectories(pdfPath.getParent());

            PdfWriter writer = new PdfWriter(pdfPath.toFile());
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            document.setFont(font);

            // ===== Title =====
            document.add(new Paragraph("WEEKLY ENVIRONMENT REPORT WITH AI ANALYSIS")
                    .setBold()
                    .setFontSize(18));
            document.add(new Paragraph("Report Date: " + reportData.get("date")));
            document.add(new Paragraph("Generated On: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
            document.add(new Paragraph("\n"));

            // ===== Table for Cities =====
            List<Map<String, Object>> cities = (List<Map<String, Object>>) reportData.get("cities");
            if (cities != null && !cities.isEmpty()) {
                float[] columnWidths = {100f, 50f, 50f, 50f, 50f, 50f, 50f, 50f, 50f};
                Table table = new Table(columnWidths);
                table.addHeaderCell("City");
                table.addHeaderCell("AQI");
                table.addHeaderCell("Evolution");
                table.addHeaderCell("Red Alerts");
                table.addHeaderCell("Yellow Warnings");
                table.addHeaderCell("Temp (°C)");
                table.addHeaderCell("Humidity (%)");
                table.addHeaderCell("Active Stations");
                table.addHeaderCell("Alert Level");

                for (Map<String, Object> city : cities) {
                    table.addCell(getString(city, "name"));
                    table.addCell(formatNumber(city.get("aqiMoyen"), 2));
                    table.addCell(getString(city, "evolution"));
                    table.addCell(formatInteger(city.get("alertesRouges")));
                    table.addCell(formatInteger(city.get("avertissementsJaunes")));
                    table.addCell(formatNumber(city.get("tempMoyen"), 1));
                    table.addCell(formatNumber(city.get("humidityMoyen"), 1));
                    table.addCell(formatInteger(city.get("stationsActives")));
                    table.addCell(getString(city, "alertColor"));
                }

                document.add(table);
                document.add(new Paragraph("\n"));
            }

            // ===== AI Analysis =====
            String aiAnalysis = reportData.get("aiAnalysis") != null ? reportData.get("aiAnalysis").toString() : "No AI analysis available";
            String[] parts = aiAnalysis.split("solution:", 2);
            String problemText = parts.length > 0 ? parts[0].replace("problem:", "").trim() : "";
            String solutionText = parts.length > 1 ? parts[1].trim() : "";

            document.add(new Paragraph("AI ANALYSIS").setBold().setFontSize(14));
            document.add(new Paragraph("Problem:").setBold());
            document.add(new Paragraph(problemText).setFontSize(12));
            document.add(new Paragraph("\nSolution:").setBold());
            document.add(new Paragraph(solutionText).setFontSize(12));
            document.add(new Paragraph("\n"));

            // ===== Full Report Data (JSON) =====
            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            String jsonReport = mapper.writeValueAsString(reportData);

            document.add(new Paragraph("\n").setFontSize(4)); // small space
            document.add(new Paragraph("────────────────────────────────────────────────────────────")
                    .setBold()
                    .setFontSize(12));
            document.add(new Paragraph("\n").setFontSize(4)); // small space


            Paragraph p1 = new Paragraph();
            p1.add(new Text("AQI : ").setBold());
            p1.add(new Text("Air Quality Index"));
            document.add(p1);

            Paragraph p2 = new Paragraph();
            p2.add(new Text("Evolution : ").setBold());
            p2.add(new Text("Change or variation of the AQI compared to the previous week"));
            document.add(p2);

            Paragraph p3 = new Paragraph();
            p3.add(new Text("Temp : ").setBold());
            p3.add(new Text("Air temperature in degrees Celsius (°C)"));
            document.add(p3);

            Paragraph p4 = new Paragraph();
            p4.add(new Text("Humidity : ").setBold());
            p4.add(new Text("Air humidity percentage (%)"));
            document.add(p4);

            Paragraph p5 = new Paragraph();
            p5.add(new Text("Active Stations : ").setBold());
            p5.add(new Text("Number of stations actively collecting data this week"));
            document.add(p5);

            Paragraph p6 = new Paragraph();
            p6.add(new Text("Alert Level : ").setBold());
            p6.add(new Text("Alert level based on AQI (GREEN, YELLOW, RED)"));
            document.add(p6);


            document.close();
            return pdfPath;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public String analyzeReportWithAI(Map<String, Object> reportData) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String jsonReport = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(reportData);

            String systemMessage = """
        You are an environmental AI analyst.
        Analyze weekly pollution, temperature, and humidity data from various cities.
        Provide your answer in this format:
        problem:  summarize key environmental issues found 
        solution:  suggest realistic actions to improve the situation 
        """;

            String userMessage = "Here is this week's report data:\n" + jsonReport;

            StringBuilder aiResponse = new StringBuilder();

            vertexAiService.askStream(systemMessage, userMessage, partial -> {
                aiResponse.append(partial);
            });

            return aiResponse.toString();

        } catch (Exception e) {
            return "AI analysis failed: " + e.getMessage();
        }
    }


}
