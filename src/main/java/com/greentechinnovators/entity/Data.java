package com.greentechinnovators.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Getter
@Setter
@Document(collection = "data")
public class Data {
    @Id
    private String id;
    private Double temp;
    private Float humidity;
    private Integer pression;
    private Integer co2;
    private Integer gas;
    private Double uv;
    private Integer lumiere;
    private LocalDateTime timestamp; // <-- add this

    public Data(String id, Double temp, Float humidity, Integer pression, Integer co2, Integer gas, Double uv, Integer lumiere, LocalDateTime timestamp) {
        this.id = id;
        this.temp = temp;
        this.humidity = humidity;
        this.pression = pression;
        this.co2 = co2;
        this.gas = gas;
        this.uv = uv;
        this.lumiere = lumiere;
        this.timestamp = timestamp;
    }

    public Data() {
        this.timestamp = LocalDateTime.now(); // auto-set timestamp for new entries
    }
}