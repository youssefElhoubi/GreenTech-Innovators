package com.greentechinnovators.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document
@Getter
@Setter
public class City {
    @Id
    private String id;
    private String name;
    private List<Station> stations;

    public City(String id, String name, List<Station> stations) {
        this.id = id;
        this.name = name;
        this.stations = stations;
    }
    public City() {
    }
}
