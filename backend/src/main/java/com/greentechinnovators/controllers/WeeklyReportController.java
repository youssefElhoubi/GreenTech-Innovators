package com.greentechinnovators.controllers;

import com.greentechinnovators.service.WeeklyReportService;
import com.greentechinnovators.dto.WeeklyReportDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weekly-reports")
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;

    public WeeklyReportController(WeeklyReportService weeklyReportService) {
        this.weeklyReportService = weeklyReportService;
    }

    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getReportData() {
        Map<String, Object> reportJson = weeklyReportService.generateReportData();
        return ResponseEntity.ok(reportJson);
    }


    @GetMapping("/csv")
    public ResponseEntity<String> getCsvReport() {
        Path path = weeklyReportService.generateCsvReport();
        return ResponseEntity.ok(path != null ? path.toString() : "No report generated");
    }
}
