package com.greentechinnovators.service;

import com.greentechinnovators.dto.DataDto;
import com.greentechinnovators.entity.Data;
import com.greentechinnovators.mappers.DataMapper;
import com.greentechinnovators.repository.DataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DataService {
    private final DataRepository dataRepository;
    @Autowired
    private DataMapper dataMapper;

    public DataService(DataRepository dataRepository) {
        this.dataRepository = dataRepository;
    }
    public List<Data> all(){
        return dataRepository.findAll();
    }
    public Data add(DataDto dto){
        Data entity = dataMapper.toEntity(dto);
        return dataRepository.save(entity);
    }
}
