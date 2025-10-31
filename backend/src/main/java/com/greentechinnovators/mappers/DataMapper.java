package com.greentechinnovators.mappers;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import org.springframework.stereotype.Component;

@Component
public class DataMapper {

    public static DataDto toDto(Data data) {
        if (data == null) return null;

        DataDto dto = new DataDto();
        dto.setId(data.getId());
        dto.setTemp(data.getTemp());
        dto.setHumidity(data.getHumidity());
        dto.setPression(data.getPression());
        dto.setCo2(data.getCo2());
        dto.setGas(data.getGas());
        dto.setUv(data.getUv());
        dto.setLumiere(data.getLumiere());
        return dto;
    }

    public static Data toEntity(DataDto dto) {
        if (dto == null) return null;

        Data data = new Data();
        data.setId(dto.getId());
        data.setTemp(dto.getTemp());
        data.setHumidity(dto.getHumidity());
        data.setPression(dto.getPression());
        data.setCo2(dto.getCo2());
        data.setGas(dto.getGas());
        data.setUv(dto.getUv());
        data.setLumiere(dto.getLumiere());
        return data;
    }
}
