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
import java.util.Optional;
import java.util.ArrayList;


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
        return stationRepository.findByAdresseMAC(addressMAC);
    }
    public Station updateStation(Station station) {
        return stationRepository.save(station);
    }

    public StationDto update(String id, StationDto dto) {
        Station existing = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));

        existing.setName(dto.getName());
        existing.setAdresseMAC(dto.getAdresseMAC());
        existing.setLatitude(dto.getLatitude());
        existing.setLongitude(dto.getLongitude());

        if (dto.getCityId() != null) {
            City city = cityRepository.findById(dto.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found with id: " + dto.getCityId()));
            existing.setCity(city);
        }

        Station updated = stationRepository.save(existing);
        return stationMapper.toDto(updated);
    }
    public void delete(String id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));
        stationRepository.delete(station);
    }
    

    public Station saveMacAddress(String mac) {
        Optional<Station> existingStation = Optional.ofNullable(stationRepository.findByAdresseMAC(mac));

        if (existingStation.isPresent()) {
            System.out.println(" Station already exists for MAC: " + mac);
            return existingStation.get();
        }

        Station newStation = new Station();
        newStation.setAdresseMAC(mac);
        newStation.setName("Station " + mac.substring(Math.max(0, mac.length() - 4)));
        newStation.setLatitude(0.0);
        newStation.setLongitude(0.0);

        newStation.setData(new ArrayList<>());

        Station saved = stationRepository.save(newStation);
        System.out.println(" Saved new station with MAC: " + mac);
        return saved;
    }


}
