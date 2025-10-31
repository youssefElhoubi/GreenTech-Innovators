package com.greentechinnovators.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.greentechinnovators.entity.Data;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DataRepository extends MongoRepository<Data,String> {
    List<Data> findByTimestampAfter(LocalDateTime timestamp);
}
