package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.service.DataService;
import com.greentechinnovators.service.StationsService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
public class DataWebSocketController {
    private final DataService dataService;
    private final StationsService stationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public DataWebSocketController(DataService dataService, StationsService stationRepository, SimpMessagingTemplate messagingTemplate) {
        this.dataService = dataService;
        this.stationRepository = stationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/addData")
    @SendTo("/topic/data")
    public Data addData(DataDto data) {
        System.out.println("Received new data from IoT device: " + data);
        
        Data edata = dataService.add(data);


        Station station = stationRepository.findByAddressMAC(data.getMac());
        
        // if (station != null) {
        //     station.getData().add(edata);
        //     stationRepository.updateStation(station);
        // }else{
        //     return null;
        // }
        
        // Broadcast the new data to all subscribers in real-time
        messagingTemplate.convertAndSend("/topic/data", edata);
        System.out.println("Broadcasted new data to all WebSocket subscribers");
        
        return edata;
    }

    @MessageMapping("/getData")
    @SendTo("/topic/data")
    public List<Data> getData() {
        System.out.println("Client requested all data");
        return dataService.all();
    }
}
