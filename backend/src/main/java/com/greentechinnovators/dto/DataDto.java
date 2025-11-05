package com.greentechinnovators.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DataDto {

    private String id;

    @NotNull(message = "Temperature is required")
    private Double temp;

    @NotNull(message = "Humidity is required")
    private Float humidity;

    @NotNull(message = "Pression is required")
    @PositiveOrZero(message = "Pression cannot be negative")
    private Integer pression;

    @NotNull(message = "CO2 value is required")
    @PositiveOrZero(message = "CO2 cannot be negative")
    private Integer co2;

    @NotNull(message = "Gas value is required")
    @PositiveOrZero(message = "Gas cannot be negative")
    private Integer gas;

    @NotNull(message = "UV index is required")
    @DecimalMin(value = "0.0", message = "UV cannot be negative")
    private Double uv;


    private String mac;

    public DataDto(String id, Double temp, Float humidity, Integer pression, Integer co2, Integer gas, Double uv, Integer lumiere, String mac) {
        this.id = id;
        this.temp = temp;
        this.humidity = humidity;
        this.pression = pression;
        this.co2 = co2;
        this.gas = gas;
        this.uv = uv;
        this.mac = mac;
    }

    public DataDto() {
    }
}
