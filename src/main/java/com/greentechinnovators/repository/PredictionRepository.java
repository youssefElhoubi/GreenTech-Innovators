package com.greentechinnovators.repository;

import com.greentechinnovators.entity.Prediction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PredictionRepository extends MongoRepository<Prediction,String > {
}
