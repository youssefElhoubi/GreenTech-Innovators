package com.greentechinnovators.service;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.mappers.DataMapper;
import com.greentechinnovators.repository.DataRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;


import java.util.List;

@Service
public class DataService {
    private final DataRepository dataRepository;

    public DataService(DataRepository dataRepository) {
        this.dataRepository = dataRepository;
    }

    public List<Data> all() {
        return dataRepository.findAll();
    }

    public Data add(DataDto dto) {
        Data entity = DataMapper.toEntity(dto);
        entity.setTimestamp(LocalDateTime.now());
        return dataRepository.save(entity);
    }

    // Get last 7 days data
    public List<Data> getLastWeekData() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        return dataRepository.findByTimestampAfter(weekAgo);
    }

    // Get last 30 days data
    public List<Data> getLastMonthData() {
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        return dataRepository.findByTimestampAfter(monthAgo);
    }
}
