package com.smartlpd.repository;

import com.smartlpd.model.DetectionHistory;
import com.smartlpd.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetectionHistoryRepository extends JpaRepository<DetectionHistory, Long> {
    List<DetectionHistory> findByUserOrderByDetectionTimeDesc(User user);
}