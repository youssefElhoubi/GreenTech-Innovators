package com.greentechinnovators.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.greentechinnovators.entity.Data;
import org.springframework.stereotype.Repository;

@Repository
public interface DataRepository extends MongoRepository<Data,String> {

    List<Data> findFirst10ByOrderByIdDesc();
}
