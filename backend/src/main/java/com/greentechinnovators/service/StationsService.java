package com.greentechinnovators.service;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.mappers.StationMapper;
import com.greentechinnovators.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class StationsService {
    @Autowired
    private StationMapper stationMapper;

    private StationRepository stationRepository;

    public StationsService(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    public Station add(StationDto dto) {
        Station station = stationMapper.toEntity(dto);
        return stationRepository.save(station);
    }

    public List<Station> all() {
        return stationRepository.findAll();
    }
    public Station findByAddressMAC(String addressMAC) {
        return stationRepository.findByAddressMAC(addressMAC);
    }
    public Station updateStation(Station station) {
        return stationRepository.save(station);
    }


}
