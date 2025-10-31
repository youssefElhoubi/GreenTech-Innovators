package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.repository.StationRepository;
import com.greentechinnovators.service.DataService;
import com.greentechinnovators.service.StationsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data")
public class dataController {
    private final DataService dataService;
    private final StationsService stationRepository;

    public dataController(DataService dataService ,  StationsService stationRepository) {
        this.dataService = dataService;
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<Data> all() {
        return dataService.all();
    }

    @PostMapping("{address}")
    public ResponseEntity<?> add(@Valid @RequestBody DataDto data, @PathVariable String addressMAC) {
        Data edata = dataService.add(data);
        Station station = stationRepository.findByAddressMAC(addressMAC);
        station.getData().add(edata);
        stationRepository.updateStation(station);
        return ResponseEntity.ok("new data was added");
    }
    @GetMapping("past/week")
    public List<Data> pastWeek() {
        return dataService.getLastWeekData();
    }
    @GetMapping("past/mount")
    public List<Data> pastMount() {
        return dataService.getLastMonthData();
    }
}
