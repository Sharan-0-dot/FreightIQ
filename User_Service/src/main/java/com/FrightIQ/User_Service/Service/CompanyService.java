package com.FrightIQ.User_Service.Service;

import com.FrightIQ.User_Service.DTO.CompanyRequestDTO;
import com.FrightIQ.User_Service.Entities.Company;
import com.FrightIQ.User_Service.Repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;

    public Company registerCompany(CompanyRequestDTO dto) {
        if (companyRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Company with this email already exists");
        }
        if (companyRepository.existsByGstNumber(dto.getGstNumber())) {
            throw new RuntimeException("Company with this GST number already exists");
        }
        if (companyRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("Company with this phone already exists");
        }

        Company company = new Company();
        company.setName(dto.getName());
        company.setEmail(dto.getEmail());
        company.setPhone(dto.getPhone());
        company.setGstNumber(dto.getGstNumber());
        company.setIndustry(dto.getIndustry());
        company.setCity(dto.getCity());
        company.setState(dto.getState());
        company.setRatingAverage(0.0);
        company.setTotalShipmentsPosted(0);
        company.setTotalShipmentsCompleted(0);

        return companyRepository.save(company);
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company getCompanyById(String id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));
    }

    public Company updateCompany(String id, CompanyRequestDTO dto) {
        Company existing = getCompanyById(id);

        // Check uniqueness only if the value actually changed
        if (!existing.getEmail().equals(dto.getEmail()) && companyRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use by another company");
        }
        if (!existing.getGstNumber().equals(dto.getGstNumber()) && companyRepository.existsByGstNumber(dto.getGstNumber())) {
            throw new RuntimeException("GST number already in use by another company");
        }
        if (!existing.getPhone().equals(dto.getPhone()) && companyRepository.existsByPhone(dto.getPhone())) {
            throw new RuntimeException("Phone already in use by another company");
        }

        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        existing.setGstNumber(dto.getGstNumber());
        existing.setIndustry(dto.getIndustry());
        existing.setCity(dto.getCity());
        existing.setState(dto.getState());

        return companyRepository.save(existing);
    }

    public void deleteCompany(String id) {
        if (!companyRepository.existsById(id)) {
            throw new RuntimeException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }
}
