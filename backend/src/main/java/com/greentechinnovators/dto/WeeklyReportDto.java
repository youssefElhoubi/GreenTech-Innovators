package com.greentechinnovators.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WeeklyReportDto {
    private String date;
    private String city;
    private double aqiMoyen;
    private String evolution;
    private int alertesRouges;
    private int avertissementsJaunes;
    private double tempMoyen;
    private double humidityMoyen;
    private int stationsActives;
    private String alertColor;
}
