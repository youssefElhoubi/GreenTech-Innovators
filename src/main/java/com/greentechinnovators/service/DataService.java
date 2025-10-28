package com.greentechinnovators.service;

import com.greentechinnovators.entity.Data;
import com.greentechinnovators.repository.DataRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DataService {
    private final DataRepository dataRepository;

    public DataService(DataRepository dataRepository) {
        this.dataRepository = dataRepository;
    }
    public List<Data> all(){
        return dataRepository.findAll();
    }
    public Data add(Data data){
        return dataRepository.save(data);
    }
}
