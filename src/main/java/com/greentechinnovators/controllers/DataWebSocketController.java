package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.service.DataService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class DataWebSocketController {
    private final DataService dataService;

    public DataWebSocketController(DataService dataService) {
        this.dataService = dataService;
    }

    @MessageMapping("/addData")
    @SendTo("/topic/data")
    public Data addData(DataDto data) {
        return dataService.add(data);
    }

    @MessageMapping("/getData")
    @SendTo("/topic/data")
    public List<Data> getData() {
        return dataService.all();
    }
}
