package com.greentechinnovators.controllers;

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
    public List<Data> addData(Data data) {
        System.out.println(data.getHumidity());
        dataService.add(data);
        return dataService.all();
    }

    @MessageMapping("/getData")
    @SendTo("/topic/data")
    public List<Data> getData() {
        return dataService.all();
    }
}
