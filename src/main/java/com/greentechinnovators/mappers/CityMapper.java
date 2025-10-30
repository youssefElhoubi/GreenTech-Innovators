package com.greentechinnovators.mapper;

import com.greentechinnovators.dto.CityDto;
import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.entity.Station;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CityMapper {

    public City toEntity(CityDto dto) {
        if (dto == null) return null;

        City city = new City();
        city.setName(dto.getName());
        city.setStations(
                dto.getStations() != null
                        ? dto.getStations().stream()
                        .map(this::stationDtoToEntity)
                        .collect(Collectors.toList())
                        : null
        );
        return city;
    }

    public CityDto toDto(City entity) {
        if (entity == null) return null;

        CityDto dto = new CityDto();
        dto.setName(entity.getName());
        dto.setStations(
                entity.getStations() != null
                        ? entity.getStations().stream()
                        .map(this::stationEntityToDto)
                        .collect(Collectors.toList())
                        : null
        );
        return dto;
    }

    private Station stationDtoToEntity(StationDto dto) {
        if (dto == null) return null;
        Station s = new Station();
        s.setCity(dto.getCity());
        s.setLatitude(dto.getLatitude());
        s.setLongitude(dto.getLongitude());
        s.setAdresseMAC(dto.getAdresseMAC());
        s.setCapteursInstallés(dto.getCapteursInstallés());
        return s;
    }

    private StationDto stationEntityToDto(Station entity) {
        if (entity == null) return null;
        StationDto dto = new StationDto();
        dto.setCity(entity.getCity());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setAdresseMAC(entity.getAdresseMAC());
        dto.setCapteursInstallés(entity.getCapteursInstallés());
        return dto;
    }
}
