package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.service.DataService;
import com.greentechinnovators.service.StationsService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
public class DataWebSocketController {
    private final DataService dataService;
    private final StationsService stationRepository;

    public DataWebSocketController(DataService dataService ,  StationsService stationRepository) {
        this.dataService = dataService;
        this.stationRepository = stationRepository;
    }

    @MessageMapping("/addData/{address}")
    @SendTo("/topic/data")
    public ResponseEntity<String> addData(DataDto data , @PathVariable String address ) {
        Data edata = dataService.add(data);
        Station station = stationRepository.findByAddressMAC(address);
        station.getData().add(edata);
        stationRepository.updateStation(station);
        return ResponseEntity.ok("new data was added");
    }

    @MessageMapping("/getData")
    @SendTo("/topic/data")
    public List<Data> getData() {
        return dataService.all();
    }
}
