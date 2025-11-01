package com.greentechinnovators.mappers;

import com.greentechinnovators.dto.CityDto;
import com.greentechinnovators.entity.City;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CityMapper {

    public CityDto toDto(City city) {
        if (city == null) return null;

        CityDto dto = new CityDto();
        dto.setId(city.getId());
        dto.setName(city.getName());
        if (city.getStations() != null) {
            dto.setStations(city.getStations()
                    .stream()
                    .map(StationMapper::toDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public static City toEntity(CityDto dto) {
        if (dto == null) return null;

        City city = new City();
        city.setId(dto.getId());
        city.setName(dto.getName());
        if (dto.getStations() != null) {
            city.setStations(dto.getStations()
                    .stream()
                    .map(StationMapper::toEntity)
                    .collect(Collectors.toList()));
        }
        return city;
    }
}
