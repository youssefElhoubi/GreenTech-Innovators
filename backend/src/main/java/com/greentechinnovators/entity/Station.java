package com.greentechinnovators.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Setter
@Document(collection = "stations")
public class Station {

    @Id
    private String id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String addressMAC;

    // Reference to city (avoid circular data embedding)
    @DBRef(lazy = true)
    private City city;

    // Reference to the data sensors installed
    @DBRef
    private List<Data> data;

    public Station() {}

    public Station(String id, String name, Double latitude, Double longitude, String adressMAC, City city, List<Data> data) {
        this.id = id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.addressMAC = adressMAC;
        this.city = city;
        this.data = data;
    }
}
