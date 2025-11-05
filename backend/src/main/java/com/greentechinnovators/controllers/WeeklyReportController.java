package com.greentechinnovators.controllers;

import com.greentechinnovators.service.WeeklyReportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Files;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
public class WeeklyReportController {

    private final WeeklyReportService reportService;

    public WeeklyReportController(WeeklyReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/weekly")
    public ResponseEntity<String> generateWeeklyReport() {
        Path path = reportService.generateCsvReport();

        if (path == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Échec de la génération du rapport.");
        }

        return ResponseEntity.ok("✅ Rapport généré avec succès : " + path.toAbsolutePath());
    }

    @GetMapping("/download")
    public ResponseEntity<?> downloadReport() {
        try {
            Path reportsDir = Path.of("reports");
            if (!Files.exists(reportsDir)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("❌ Aucun dossier de rapports trouvé.");
            }

            Optional<Path> latestReport = Files.list(reportsDir)
                    .filter(path -> path.getFileName().toString().startsWith("weekly-report-"))
                    .max((p1, p2) -> Long.compare(p1.toFile().lastModified(), p2.toFile().lastModified()));

            if (latestReport.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("❌ Aucun rapport trouvé à télécharger.");
            }

            Path reportPath = latestReport.get();
            byte[] file = Files.readAllBytes(reportPath);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + reportPath.getFileName())
                    .body(file);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Erreur lors du téléchargement du rapport : " + e.getMessage());
        }
    }


    /**
     * Récupère les données du rapport en JSON pour le frontend
     * GET /api/reports/data
     */
    @GetMapping("/data")
    public ResponseEntity<?> getReportData() {
        try {
            Map<String, Object> reportData = reportService.generateReportData();

            if (reportData == null || reportData.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body(Map.of("message", "Aucune donnée disponible"));
            }

            return ResponseEntity.ok(reportData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la récupération des données : " + e.getMessage()));
        }
    }
}
