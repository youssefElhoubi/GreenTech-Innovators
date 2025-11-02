package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.service.StationsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import java.util.List;

import org.springframework.http.ResponseEntity;
import java.util.Map;
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


    @PostMapping("/esp32/saveMac")
    public ResponseEntity<String> saveMac(@RequestBody Map<String, String> body) {
        String mac = body.get("mac");
        System.out.println(" New ESP32 connecting with MAC: " + mac);

        Station station = stationsService.saveMacAddress(mac);

        return ResponseEntity.ok("MAC processed: " + station.getAddressMAC());
    }

}

