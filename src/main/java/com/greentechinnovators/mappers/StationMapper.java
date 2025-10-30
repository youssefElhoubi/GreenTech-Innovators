package com.greentechinnovators.mappers;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import org.springframework.stereotype.Component;

@Component
public class StationMapper {

    public static StationDto toDto(Station station) {
        if (station == null) return null;

        StationDto dto = new StationDto();
        dto.setId(station.getId());
        dto.setName(station.getName());
        dto.setLatitude(station.getLatitude());
        dto.setLongitude(station.getLongitude());
        dto.setAdresseMAC(station.getAddressMAC());
        dto.setCityId(station.getCity() != null ? station.getCity().getId() : null);
        dto.setData(DataMapper.toDto(station.getData()));
        return dto;
    }

    public static Station toEntity(StationDto dto) {
        if (dto == null) return null;

        Station station = new Station();
        station.setId(dto.getId());
        station.setName(dto.getName());
        station.setLatitude(dto.getLatitude());
        station.setLongitude(dto.getLongitude());
        station.setAddressMAC(dto.getAdresseMAC());
        // City reference is set later by service
        station.setData(DataMapper.toEntity(dto.getData()));
        return station;
    }
}
