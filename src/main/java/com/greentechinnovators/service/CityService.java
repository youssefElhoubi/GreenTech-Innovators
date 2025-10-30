package com.greentechinnovators.service;

import com.greentechinnovators.dto.CityDto;
import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.mappers.CityMapper;
import com.greentechinnovators.mappers.DataMapper;
import com.greentechinnovators.repository.CityRepository;
import com.greentechinnovators.repository.DataRepository;
import com.greentechinnovators.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CityService {

    private final CityRepository cityRepository;
    private final StationRepository stationRepository;
    private final DataRepository dataRepository;

    private final CityMapper cityMapper;
    @Autowired
    public CityService(CityRepository cityRepository, StationRepository stationRepository, DataRepository dataRepository, CityMapper cityMapper) {
        this.cityRepository = cityRepository;
        this.stationRepository = stationRepository;
        this.dataRepository = dataRepository;
        this.cityMapper = cityMapper;
    }

    public List<CityDto> getAllCities() {
        return cityRepository.findAll()
                .stream()
                .map(this.cityMapper::toDto)
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
        // 1️⃣ Find city safely
        City city = cityRepository.findById(id).orElse(null);
        if (city == null) {
            throw new RuntimeException("City not found with id: " + id);
        }

        // 2️⃣ Get all stations related to this city
        List<Station> stations = city.getStations();

        // 3️⃣ Collect all data objects from all stations
        List<List<Data>> allData = stations.stream().map(Station::getData).toList();

        // 4️⃣ Delete data, then stations, then city
        if (!allData.isEmpty()) {
            allData.forEach(dataRepository::deleteAll);
        }

        if (!stations.isEmpty()) {
            stationRepository.deleteAll(stations);
        }

        cityRepository.deleteById(id);
    }

    // ✅ New method: Get all stations of a specific city
    public List<StationDto> getStationsByCityId(String cityId) {

        return cityRepository.findById(cityId)
                .map(city -> city.getStations()
                        .stream()
                        .map(station -> {
                            StationDto dto = new StationDto();
                            dto.setCityId(station.getCity().getId());
                            dto.setLatitude(station.getLatitude());
                            dto.setLongitude(station.getLongitude());
                            dto.setAdresseMAC(station.getAddressMAC());
                            dto.setData(station.getData().stream().map(DataMapper::toDto).collect(Collectors.toList()));
                            return dto;
                        })
                        .collect(Collectors.toList()))
                .orElse(null);
    }
}
