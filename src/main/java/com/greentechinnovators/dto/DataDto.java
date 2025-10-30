package com.greentechinnovators.dto;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;

@Getter
@Setter
public class DataDto {
    @NotNull(message = "temp must not be null")
    private Double temp;
    @NotNull(message = "humidity must not be null")
    private Float humidity;
    @NotNull(message = "pression must not be null")
    private Integer pression;
    @NotNull(message = "co2 must not be null")
    private Integer co2;
    @NotNull(message = "gas must not be null")
    private Integer gas;
    @NotNull(message = "uv must not be null")
    private Double uv;
    @NotNull(message = " lumiere not be null")
    private Integer lumiere;

    public DataDto() {
    }

    public DataDto( Double temp, Float humidity, Integer pression, Integer co2, Integer gas, Double uv, Integer lumiere) {
        this.temp = temp;
        this.humidity = humidity;
        this.pression = pression;
        this.co2 = co2;
        this.gas = gas;
        this.uv = uv;
        this.lumiere = lumiere;
    }
}
