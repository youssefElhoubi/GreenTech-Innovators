package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.CityDto;
import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.service.CityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    private final CityService cityService;

    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    // ✅ Get all cities
    @GetMapping
    public ResponseEntity<List<CityDto>> getAllCities() {
        return ResponseEntity.ok(cityService.getAllCities());
    }

    // ✅ Get city by ID
    @GetMapping("/{id}")
    public ResponseEntity<CityDto> getCityById(@PathVariable String id) {
        CityDto city = cityService.getCityById(id);
        return city != null ? ResponseEntity.ok(city) : ResponseEntity.notFound().build();
    }

    // ✅ Create new city
//    @PostMapping
//    public ResponseEntity<CityDto> createCity(@Valid @RequestBody CityDto cityDto) {
//        CityDto created = cityService.createCity(cityDto);
//        return ResponseEntity.ok(created);
//    }

    // ✅ Update city
    @PutMapping("/{id}")
    public ResponseEntity<CityDto> updateCity(@PathVariable String id, @Valid @RequestBody CityDto cityDto) {
        CityDto updated = cityService.updateCity(id, cityDto);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // ✅ Delete city
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCity(@PathVariable String id) {
        cityService.deleteCity(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Get all stations for a city
    @GetMapping("/{id}/stations")
    public ResponseEntity<List<StationDto>> getStationsByCityId(@PathVariable String id) {
        List<StationDto> stations = cityService.getStationsByCityId(id);
        return stations != null ? ResponseEntity.ok(stations) : ResponseEntity.notFound().build();
    }
}
