package com.paralisetu.service;

import com.paralisetu.dto.RequestDTO;
import com.paralisetu.model.CBGPlant;
import com.paralisetu.model.FarmerRequest;
import com.paralisetu.repository.FarmerRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.paralisetu.repository.CBGPlantRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class RequestService {

    @Autowired
    private FarmerRequestRepository requestRepository;
    @Autowired
private CBGPlantRepository cbgRepository;
    // ✅ Create new request
    public FarmerRequest createRequest(RequestDTO dto) {

        if (dto.getFarmerId() == null || dto.getCbgId() == null)
            throw new IllegalArgumentException("Farmer ID and CBG ID are required");

        FarmerRequest request = new FarmerRequest();
        request.setFarmerId(UUID.fromString(dto.getFarmerId()));
        request.setCbgId(UUID.fromString(dto.getCbgId()));
        request.setFarmerName(dto.getFarmerName());
        request.setPhone(dto.getPhone());
        request.setAddress(dto.getAddress());
        request.setCropType(dto.getCropType());
        request.setQuantity(dto.getQuantity());
        LocalTime now = LocalTime.now();

        if (now.isBefore(LocalTime.NOON)) {
            request.setSlot("slot1");
        } else if (now.isBefore(LocalTime.of(19, 0))) {
            request.setSlot("slot2");
        } else {
            throw new RuntimeException("Request not allowed after 7:00 PM");
        }
        request.setRequestDate(LocalDate.now());
        request.setLatitude(dto.getLatitude());
        request.setLongitude(dto.getLongitude());
        request.setStatus("pending");
        request.setMessage(""); // initialize empty message

        return requestRepository.save(request);
    }

    // ✅ Fetch requests for a specific CBG
    public List<FarmerRequest> getRequestsByCBG(UUID cbgId) {
        return requestRepository.findByCbgId(cbgId);
    }

    // ✅ Update request status with messages
    public FarmerRequest updateRequestStatus(UUID requestId, String status) {
        FarmerRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        switch (status.toLowerCase()) {
            case "accepted":

                // fetch plant
                CBGPlant plant = cbgRepository.findById(req.getCbgId())
                        .orElseThrow(() -> new RuntimeException("CBG not found"));

                // 🔁 DAILY RESET
                if (plant.getLastResetDate() == null ||
                        !plant.getLastResetDate().equals(req.getRequestDate())) {

                    double total = plant.getFeedstockCapacity();

                    plant.setSlot1Capacity(total * 0.5);
                    plant.setSlot2Capacity(total * 0.5);

                    plant.setSlot1Remaining(total * 0.5);
                    plant.setSlot2Remaining(total * 0.5);

                   plant.setLastResetDate(req.getRequestDate());
                }

                // 📉 CAPACITY DEDUCTION
                if ("slot1".equals(req.getSlot())) {

                    if (plant.getSlot1Remaining() == null || 
                        plant.getSlot1Remaining() < req.getQuantity()) {
                        throw new RuntimeException("Slot 1 full");
                    }

                    plant.setSlot1Remaining(
                            plant.getSlot1Remaining() - req.getQuantity());

                } else {

                    if (plant.getSlot2Remaining() == null || 
                        plant.getSlot2Remaining() < req.getQuantity()) {
                        throw new RuntimeException("Slot 2 full");
                    }

                    plant.setSlot2Remaining(
                            plant.getSlot2Remaining() - req.getQuantity());
                }

                // save plant
                cbgRepository.save(plant);

                // update request
                req.setStatus("accepted");
                req.setMessage("Your request has been accepted. Drop the parali by 10:00 PM.");

                break;

            case "rejected":
                req.setStatus("rejected");
                req.setMessage("Your request has been rejected by CBG. Try again later.");
                break;

            case "completed":
                req.setStatus("completed");
                req.setMessage("Request completed.");
                break;

            default:
                throw new IllegalArgumentException("Invalid status: " + status);
        }

        return requestRepository.save(req);
    }
}