package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.service.StationsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/station")
public class StationController {
    private final StationsService stationsService;

    public StationController(StationsService stationsService) {
        this.stationsService = stationsService;
    }

    @PostMapping
    public Station addStation(@Valid @RequestBody StationDto data) {
        return stationsService.add(data);
    }

    @GetMapping("/all")
    public List<Station> all() {
        return stationsService.all();
    }

    @PutMapping("/{id}")
    public ResponseEntity<StationDto> updateStation(
            @PathVariable String id,
            @Valid @RequestBody StationDto data
    ) {
        StationDto updated = stationsService.update(id, data);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStation(@PathVariable String id) {
        try {
            stationsService.delete(id);
            return ResponseEntity.ok("Station supprimée avec succès !");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}

