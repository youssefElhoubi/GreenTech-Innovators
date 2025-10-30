package com.greentechinnovators.mappers;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import org.springframework.stereotype.Component;

@Component
public class StationMapper {

    // ✅ Convert DTO → Entity
    public Station toEntity(StationDto dto) {
        if (dto == null) {
            return null;
        }

        Station station = new Station();
        station.setCity(dto.getCity());
        station.setLatitude(dto.getLatitude());
        station.setLongitude(dto.getLongitude());
        station.setAdresseMAC(dto.getAdresseMAC());
        station.setCapteursInstallés(dto.getCapteursInstallés());

        return station;
    }

    // ✅ Convert Entity → DTO
    public StationDto toDto(Station entity) {
        if (entity == null) {
            return null;
        }

        StationDto dto = new StationDto();
        dto.setCity(entity.getCity());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setAdresseMAC(entity.getAdresseMAC());
        dto.setCapteursInstallés(entity.getCapteursInstallés());

        return dto;
    }
}
