package com.greentechinnovators.service;

import com.greentechinnovators.dto.StationDto;
import com.greentechinnovators.entity.Station;
import com.greentechinnovators.mappers.StationMapper;
import com.greentechinnovators.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.greentechinnovators.entity.City;
import com.greentechinnovators.repository.CityRepository;
import com.greentechinnovators.repository.DataRepository;
import com.greentechinnovators.entity.Data;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class StationsService {
    @Autowired
    private StationMapper stationMapper;
    private final CityRepository cityRepository;
    private StationRepository stationRepository;
    @Autowired
    private DataRepository dataRepository;
    @Autowired
    private MongoTemplate mongoTemplate;

    public StationsService(StationRepository stationRepository, CityRepository cityRepository) {
        this.stationRepository = stationRepository;
        this.cityRepository = cityRepository;

    }

    public Station add(StationDto dto) {
        Station station = stationMapper.toEntity(dto);
        if (dto.getCityId() != null) {
            City city = cityRepository.findById(dto.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found"));
            station.setCity(city);

            if (city.getId() == null) {
                throw new RuntimeException("City ID is null, cannot set DBRef");
            }
        }

        return stationRepository.save(station);
    }

    public List<Station> all() {
        List<Station> stations = stationRepository.findAll();

        // Peupler les données pour chaque station
        for (Station station : stations) {
            // Peupler la ville si elle est null (lazy loading)
            if (station.getCity() != null && station.getCity().getName() == null) {
                Optional<City> cityOpt = cityRepository.findById(station.getCity().getId());
                if (cityOpt.isPresent()) {
                    station.setCity(cityOpt.get());
                }
            }

            // Peupler les données de la station en cherchant par MAC address
            // Les données sont stockées avec un champ "mac" qui correspond à l'adresseMAC
            // de la station
            if (station.getAdresseMAC() != null && !station.getAdresseMAC().isEmpty()) {
                Query query = new Query(Criteria.where("mac").is(station.getAdresseMAC()));
                List<Data> stationData = mongoTemplate.find(query, Data.class);

                if (stationData != null && !stationData.isEmpty()) {
                    station.setData(stationData);
                    System.out.println("Loaded " + stationData.size() + " data points for station " + station.getName()
                            + " (MAC: " + station.getAdresseMAC() + ")");
                } else {
                    // Si pas de données trouvées par MAC, initialiser avec une liste vide
                    station.setData(new ArrayList<>());
                }
            } else {
                // Si pas de MAC, initialiser avec une liste vide
                station.setData(new ArrayList<>());
            }
        }

        return stations;
    }

    public Station findByAddressMAC(String addressMAC) {
        return stationRepository.findByAdresseMAC(addressMAC);
    }

    public Station updateStation(Station station) {
        return stationRepository.save(station);
    }

    public StationDto update(String id, StationDto dto) {
        Station existing = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));

        existing.setName(dto.getName());
        existing.setAdresseMAC(dto.getAdresseMAC());
        existing.setLatitude(dto.getLatitude());
        existing.setLongitude(dto.getLongitude());

        if (dto.getCityId() != null) {
            City city = cityRepository.findById(dto.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found with id: " + dto.getCityId()));
            existing.setCity(city);
        }

        Station updated = stationRepository.save(existing);
        return stationMapper.toDto(updated);
    }

    public void delete(String id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));
        stationRepository.delete(station);
    }

    public Station saveMacAddress(String mac) {
        Optional<Station> existingStation = Optional.ofNullable(stationRepository.findByAdresseMAC(mac));

        if (existingStation.isPresent()) {
            System.out.println(" Station already exists for MAC: " + mac);
            return existingStation.get();
        }

        Station newStation = new Station();
        newStation.setAdresseMAC(mac);
        newStation.setName("Station " + mac.substring(Math.max(0, mac.length() - 4)));
        newStation.setLatitude(0.0);
        newStation.setLongitude(0.0);

        newStation.setData(new ArrayList<>());

        Station saved = stationRepository.save(newStation);
        System.out.println(" Saved new station with MAC: " + mac);
        return saved;
    }

}
