package com.FrightIQ.User_Service.Repository;

import com.FrightIQ.User_Service.Entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {
    Optional<Company> findByEmail(String email);
    Optional<Company> findByGstNumber(String gstNumber);
    boolean existsByEmail(String email);
    boolean existsByGstNumber(String gstNumber);
    boolean existsByPhone(String phone);
}
