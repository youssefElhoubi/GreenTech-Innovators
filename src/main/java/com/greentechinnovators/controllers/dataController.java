package com.greentechinnovators.controllers;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.service.DataService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/data")
public class dataController {
    private final DataService dataService;

    public dataController(DataService dataService) {
        this.dataService = dataService;
    }

    @GetMapping
    public List<Data> all() {
        return dataService.all();
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody DataDto data) {
        dataService.add(data);
        return ResponseEntity.ok("new data was added");
    }
}
