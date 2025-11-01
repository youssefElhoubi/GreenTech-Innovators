package com.greentechinnovators.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Getter
@Setter
@Document(collection = "cities")
public class City {

    @Id
    private String id;
    private String name;

    // Reference to stations in this city
    @DBRef
    private List<Station> stations;

    public City() {}

    public City(String id, String name, List<Station> stations) {
        this.id = id;
        this.name = name;
        this.stations = stations;
    }
}
