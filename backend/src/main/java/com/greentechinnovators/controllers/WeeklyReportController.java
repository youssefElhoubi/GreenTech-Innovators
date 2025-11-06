package com.greentechinnovators.controllers;

import com.greentechinnovators.service.WeeklyReportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.nio.file.Files;
import java.util.Comparator;
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
    public ResponseEntity<String> generateWeeklyReports() {
        try {
            Path csvPath = reportService.generateCsvReport();
            if (csvPath == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("❌ Échec de la génération du CSV.");
            }

            Map<String, Object> reportData = reportService.generateReportData();
            Path pdfPath = reportService.generatePdfReportWithAI(reportData);
            if (pdfPath == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("❌ Échec de la génération du PDF.");
            }

            String message = String.format(
                    "✅ Rapports générés avec succès : CSV -> %s, PDF -> %s",
                    csvPath.toAbsolutePath(), pdfPath.toAbsolutePath()
            );

            return ResponseEntity.ok(message);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Erreur lors de la génération des rapports : " + e.getMessage());
        }
    }


    @GetMapping("/analyze")
    public ResponseEntity<String> analyzeReport() {
        Map<String, Object> report = reportService.generateReportData();
        String aiAnalysis = reportService.analyzeReportWithAI(report);
        return ResponseEntity.ok(aiAnalysis);
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


    @GetMapping("/pdf-ai")
    public ResponseEntity<byte[]> generatePdfWithAI() {
        try {
            // 1️⃣ Générer les données + AI analysis
            Map<String, Object> reportData = reportService.generateReportData();
            String aiAnalysis = reportService.analyzeReportWithAI(reportData);
            reportData.put("aiAnalysis", aiAnalysis);

            // 2️⃣ Générer le PDF
            Path pdfPath = reportService.generatePdfReportWithAI(reportData);
            if (pdfPath == null || !Files.exists(pdfPath)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null);
            }

            // 3️⃣ Lire le PDF en byte[]
            byte[] fileContent = Files.readAllBytes(pdfPath);

            // 4️⃣ Retourner le PDF en réponse HTTP
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + pdfPath.getFileName())
                    .body(fileContent);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/pdf-ai-latest")
    public ResponseEntity<InputStreamResource> downloadLatestPdf() {
        try {
            Path reportsDir = Path.of("reports");
            Optional<Path> latestFile = Files.list(reportsDir)
                    .filter(p -> p.getFileName().toString().startsWith("weekly-report-ai-") && p.toString().endsWith(".pdf"))
                    .max(Comparator.comparingLong(p -> p.toFile().lastModified()));

            if (latestFile.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            File file = latestFile.get().toFile();
            InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName())
                    .contentLength(file.length())
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }


}
