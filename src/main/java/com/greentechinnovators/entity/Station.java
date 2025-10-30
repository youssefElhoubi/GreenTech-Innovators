package com.greentechinnovators.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
@Getter
@Setter
public class Station {
    @Id
    private String id;
    private String city;
    private Double latitude;
    private Double longitude;
    private String adresseMAC;
    private String[] capteursInstallés;

    public Station(String id, String city, Double latitude, Double longitude, String adresseMAC, String[] capteursInstallés) {
        this.id = id;
        this.city = city;
        this.latitude = latitude;
        this.longitude = longitude;
        this.adresseMAC = adresseMAC;
        this.capteursInstallés = capteursInstallés;
    }

    public Station() {
    }
}
