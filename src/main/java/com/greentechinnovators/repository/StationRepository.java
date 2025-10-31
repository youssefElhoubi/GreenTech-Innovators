package com.greentechinnovators.repository;

import com.greentechinnovators.entity.Station;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends MongoRepository<Station,String> {
}
