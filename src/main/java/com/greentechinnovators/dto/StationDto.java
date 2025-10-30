package com.greentechinnovators.dto;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.*;

@Getter
@Setter
public class StationDto {

    @NotBlank(message = "City must not be blank")
    private String city;

    @NotNull(message = "Latitude must not be null")
    @DecimalMin(value = "-90.0", message = "Latitude must be greater than or equal to -90.0")
    @DecimalMax(value = "90.0", message = "Latitude must be less than or equal to 90.0")
    private Double latitude;

    @NotNull(message = "Longitude must not be null")
    @DecimalMin(value = "-180.0", message = "Longitude must be greater than or equal to -180.0")
    @DecimalMax(value = "180.0", message = "Longitude must be less than or equal to 180.0")
    private Double longitude;

    @NotBlank(message = "MAC address must not be blank")
    @Pattern(
            regexp = "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$",
            message = "Invalid MAC address format"
    )
    private String adresseMAC;

    @NotNull(message = "Installed sensors list must not be null")
    @Size(min = 1, message = "At least one sensor must be installed")
    private String[] capteursInstallés;

    public StationDto(String city, Double latitude, Double longitude, String adresseMAC, @NotNull(message = "Installed sensors list must not be null") @Size(min = 1, message = "At least one sensor must be installed") String[] capteursInstallés) {
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.adresseMAC = adresseMAC;
        this.capteursInstallés = capteursInstallés;
    }

    public StationDto() {
    }
}
