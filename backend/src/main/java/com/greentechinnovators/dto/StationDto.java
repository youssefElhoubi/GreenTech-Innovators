package com.greentechinnovators.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class StationDto {



    @NotBlank(message = "Station name is required")
    @Size(min = 2, max = 100, message = "Station name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude cannot be less than -90")
    @DecimalMax(value = "90.0", message = "Latitude cannot be greater than 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude cannot be less than -180")
    @DecimalMax(value = "180.0", message = "Longitude cannot be greater than 180")
    private Double longitude;

    @NotBlank(message = "MAC address is required")
    private String adresseMAC;

    private String cityId;

    private List<DataDto> data;

    public StationDto(String id, String name, Double latitude, Double longitude, String adresseMAC, String cityId, List<DataDto> data) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.adresseMAC = adresseMAC;
        this.cityId = cityId;
        this.data = data;
    }

    public StationDto() {
    }
}
