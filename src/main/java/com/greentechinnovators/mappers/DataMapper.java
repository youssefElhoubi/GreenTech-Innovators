package com.greentechinnovators.mappers;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import org.springframework.stereotype.Component;

@Component
public class DataMapper {

    // ✅ Convert DTO -> Entity
    public Data toEntity(DataDto dto) {
        if (dto == null) {
            return null;
        }

        Data data = new Data();
        data.setTemp(dto.getTemp());
        data.setHumidity(dto.getHumidity());
        data.setPression(dto.getPression());
        data.setCo2(dto.getCo2());
        data.setGas(dto.getGas());
        data.setUv(dto.getUv());
        data.setLumiere(dto.getLumiere());

        return data;
    }

    // ✅ Convert Entity -> DTO
    public DataDto toDto(Data entity) {
        if (entity == null) {
            return null;
        }

        DataDto dto = new DataDto();
        dto.setTemp(entity.getTemp());
        dto.setHumidity(entity.getHumidity());
        dto.setPression(entity.getPression());
        dto.setCo2(entity.getCo2());
        dto.setGas(entity.getGas());
        dto.setUv(entity.getUv());
        dto.setLumiere(entity.getLumiere());

        return dto;
    }
}
