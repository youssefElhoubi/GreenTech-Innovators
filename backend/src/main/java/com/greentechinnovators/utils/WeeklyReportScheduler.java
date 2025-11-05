package com.greentechinnovators.utils;

import com.greentechinnovators.service.WeeklyReportService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WeeklyReportScheduler {

    private final WeeklyReportService weeklyReportService;

    public WeeklyReportScheduler(WeeklyReportService weeklyReportService) {
        this.weeklyReportService = weeklyReportService;
    }

    @Scheduled(cron = "0 0 9 * * MON")
    public void run() {
        weeklyReportService.generateCsvReport();
    }
}
