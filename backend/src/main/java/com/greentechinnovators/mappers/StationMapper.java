package com.greentechinnovators.mappers;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import org.springframework.stereotype.Component;

@Component
public class StationMapper {

    public static StationDto toDto(Station station) {
        if (station == null) return null;

        StationDto dto = new StationDto();
        dto.setName(station.getName());
        dto.setLatitude(station.getLatitude());
        dto.setLongitude(station.getLongitude());
        dto.setAdresseMAC(station.getAdresseMAC());
        dto.setCityId(station.getCity() != null ? station.getCity().getId() : null);
        dto.setData(station.getData().stream().map(DataMapper::toDto).toList());
        return dto;
    }

    public static Station toEntity(StationDto dto) {
        if (dto == null) return null;

        Station station = new Station();
        station.setName(dto.getName());
        station.setLatitude(dto.getLatitude());
        station.setLongitude(dto.getLongitude());
        station.setAdresseMAC(dto.getAdresseMAC());
        // City reference is set later by service
        station.setData(dto.getData().stream().map(DataMapper::toEntity).toList());
        return station;
    }
}
