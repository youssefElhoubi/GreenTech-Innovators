package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.service.StationsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("station")
public class StationController {
    private final StationsService stationsService;

    public StationController(StationsService stationsService) {
        this.stationsService = stationsService;
    }

    @GetMapping()
    public Station addStation(@Valid @RequestBody StationDto data) {
        return stationsService.add(data);
    }
    @GetMapping("/all")
    public List<Station> all() {
        return stationsService.all();
    }
}

