package com.greentechinnovators.repository;

import com.greentechinnovators.entity.City;
import com.greentechinnovators.entity.Prediction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.greentechinnovators.enums.PredictionStatus;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PredictionRepository extends MongoRepository<Prediction,String > {

    long countByPredictionStatus(PredictionStatus status);

    long countByPredictionStatusAndDateBetween(PredictionStatus status, LocalDate start, LocalDate end);
    Optional<Prediction> findByCityAndDate(City city, LocalDate date);
}
