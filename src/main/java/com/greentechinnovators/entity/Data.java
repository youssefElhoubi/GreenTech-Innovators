package com.greentechinnovators.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "data")
public class Data {
    @Id
    private String id;
    private Double temp;
    private Float humidity;
    private Double pressure; // (BMP280)
    private Double co2;      // (MQ-135)
    private Double gas;      // (MICS-5524)
    private Double uv;       // (ML8511)
    private Double light;    // (BH1750)
    private String device;   // (ESP32)

    public Data(String id, Double temp, Float humidity , Double pressure, Double co2, Double gas, Double uv, Double light, String device) {
        this.id=id;
        this.temp = temp;
        this.humidity = humidity;
        this.pressure = pressure;
        this.co2 = co2;
        this.gas = gas;
        this.uv = uv;
        this.light = light;
        this.device = device;
    }

    public Data() {
    }
}
