package com.greentechinnovators.utils;

import com.greentechinnovators.service.WeeklyReportService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class WeeklyReportScheduler {

    private final WeeklyReportService weeklyReportService;

    public WeeklyReportScheduler(WeeklyReportService weeklyReportService) {
        this.weeklyReportService = weeklyReportService;
    }

    @Scheduled(cron = "0 * * * * *")
    public void run() {
        weeklyReportService.generateCsvReport();
        Map<String, Object> reportData = weeklyReportService.generateReportData();
        String aiAnalysis = weeklyReportService.analyzeReportWithAI(reportData);
        reportData.put("aiAnalysis", aiAnalysis);
        weeklyReportService.generatePdfReportWithAI(reportData);
    }
}
