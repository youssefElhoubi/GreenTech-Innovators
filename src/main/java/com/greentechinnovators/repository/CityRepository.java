package com.greentechinnovators.repository;

import com.greentechinnovators.entity.City;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CityRepository extends MongoRepository<City, String> {
    City findByName(String name);
}
