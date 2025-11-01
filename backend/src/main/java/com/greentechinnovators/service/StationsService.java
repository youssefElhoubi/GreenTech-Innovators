package com.greentechinnovators.service;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.mappers.StationMapper;
import com.greentechinnovators.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.repository.CityRepository;
import java.util.List;

@Service
public class StationsService {
    @Autowired
    private StationMapper stationMapper;
    private final CityRepository cityRepository;
    private StationRepository stationRepository;

    public StationsService(StationRepository stationRepository , CityRepository cityRepository) {
        this.stationRepository = stationRepository;
        this.cityRepository = cityRepository;

    }

    public Station add(StationDto dto) {
        Station station = stationMapper.toEntity(dto);
        if (dto.getCityId() != null) {
            City city = cityRepository.findById(dto.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found"));
            station.setCity(city);

            if (city.getId() == null) {
                throw new RuntimeException("City ID is null, cannot set DBRef");
            }
        }

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
