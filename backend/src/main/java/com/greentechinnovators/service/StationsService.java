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
        System.out.println("===== DTO reçu =====");
        System.out.println("Name: " + dto.getName());
        System.out.println("Latitude: " + dto.getLatitude());
        System.out.println("Longitude: " + dto.getLongitude());
        System.out.println("Adresse MAC: " + dto.getAdresseMAC());
        System.out.println("CityId: " + dto.getCityId());
        System.out.println("Data: " + dto.getData());

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

    

    public Station saveMacAddress(String mac) {
        Optional<Station> existingStation = Optional.ofNullable(stationRepository.findByAddressMAC(mac));

        if (existingStation.isPresent()) {
            System.out.println(" Station already exists for MAC: " + mac);
            return existingStation.get();
        }

        Station newStation = new Station();
        newStation.setAddressMAC(mac);
        newStation.setName("Station " + mac.substring(Math.max(0, mac.length() - 4)));
        newStation.setLatitude(0.0);
        newStation.setLongitude(0.0);

        Station saved = stationRepository.save(newStation);
        System.out.println(" Saved new station with MAC: " + mac);
        return saved;
    }


}
