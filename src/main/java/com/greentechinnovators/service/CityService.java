package com.greentechinnovators.service;

import com.greentechinnovators.dto.CityDto;
import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.mapper.CityMapper;
import com.greentechinnovators.repository.CityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CityService {

    private final CityRepository cityRepository;
    private final CityMapper cityMapper;

    public CityService(CityRepository cityRepository, CityMapper cityMapper) {
        this.cityRepository = cityRepository;
        this.cityMapper = cityMapper;
    }

    public List<CityDto> getAllCities() {
        return cityRepository.findAll()
                .stream()
                .map(cityMapper::toDto)
                .collect(Collectors.toList());
    }

    public CityDto getCityById(String id) {
        return cityRepository.findById(id)
                .map(cityMapper::toDto)
                .orElse(null);
    }

    public CityDto createCity(CityDto dto) {
        City city = cityMapper.toEntity(dto);
        City saved = cityRepository.save(city);
        return cityMapper.toDto(saved);
    }

    public CityDto updateCity(String id, CityDto dto) {
        return cityRepository.findById(id)
                .map(existing -> {
                    existing.setName(dto.getName());
                    existing.setStations(cityMapper.toEntity(dto).getStations());
                    return cityMapper.toDto(cityRepository.save(existing));
                })
                .orElse(null);
    }

    public void deleteCity(String id) {
        cityRepository.deleteById(id);
    }

    // ✅ New method: Get all stations of a specific city
    public List<StationDto> getStationsByCityId(String cityId) {
        return cityRepository.findById(cityId)
                .map(city -> city.getStations()
                        .stream()
                        .map(station -> {
                            StationDto dto = new StationDto();
                            dto.setCity(station.getCity());
                            dto.setLatitude(station.getLatitude());
                            dto.setLongitude(station.getLongitude());
                            dto.setAdresseMAC(station.getAdresseMAC());
                            dto.setCapteursInstallés(station.getCapteursInstallés());
                            return dto;
                        })
                        .collect(Collectors.toList()))
                .orElse(null);
    }
}
