package com.greentechinnovators.repository;

import com.greentechinnovators.entity.Prediction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PredictionRepository extends MongoRepository<String, Prediction> {
}
