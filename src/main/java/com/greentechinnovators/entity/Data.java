package com.greentechinnovators.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collation = "data")
public class Data {
    @Id
    private String id;
    private Double temp;
    private Float humidity;

    public Data(String id, Double temp, Float humidity) {
        this.id=id;
        this.temp = temp;
        this.humidity = humidity;
    }

    public Data() {
    }
}
