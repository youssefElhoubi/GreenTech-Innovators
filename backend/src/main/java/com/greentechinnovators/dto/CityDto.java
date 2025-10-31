package com.greentechinnovators.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CityDto {

    @NotBlank(message = "City name is required")
    @Size(min = 2, max = 100, message = "City name must be between 2 and 100 characters")
    private String name;

    private List<StationDto> stations;

    public CityDto(String name, List<StationDto> stations) {
        this.name = name;
        this.stations = stations;
    }

    public CityDto() {
    }
}
