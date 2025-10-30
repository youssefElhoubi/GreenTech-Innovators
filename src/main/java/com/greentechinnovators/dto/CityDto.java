package com.greentechinnovators.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CityDto {

    @NotBlank(message = "City name must not be blank")
    private String name;

    @NotNull(message = "Stations list cannot be null")
    @Size(min = 1, message = "At least one station must be provided")
    @Valid
    private List<StationDto> stations; // uses your existing StationDto
}
