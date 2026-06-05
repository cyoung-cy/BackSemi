package web.mvc.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.mvc.domain.resource.Equipment;
import web.mvc.domain.resource.Resource;
import web.mvc.domain.resource.Room;
import web.mvc.dto.request.EquipmentRequestDto;
import web.mvc.dto.request.RoomRequestDto;
import web.mvc.dto.response.EquipmentResponseDto;
import web.mvc.dto.response.RoomResponseDto;
import web.mvc.repository.ResourceRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) //이터 변경이 필요한 메서드에만 @Transactional을 따로 붙여서 오버라이드
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // =====================
    // 관리자 - 회의실 등록
    // =====================
    @Transactional
    public RoomResponseDto createRoom(RoomRequestDto dto) {
        validateRoomRequest(dto);

        Room room = dto.toEntity();
        resourceRepository.save(room);

        return RoomResponseDto.from(room);
    }

    // 관리자 - 장비 등록
    @Transactional
    public EquipmentResponseDto createEquipment(EquipmentRequestDto dto) {
        validateEquipmentRequest(dto);

        Equipment equipment = dto.toEntity();
        resourceRepository.save(equipment);

        return EquipmentResponseDto.from(equipment);
    }

    // 관리자 - 회의실 수정
    @Transactional
    public RoomResponseDto updateRoom(Integer id, RoomRequestDto dto) {
        validateRoomRequest(dto);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        // Room 타입 검증
        if (!(resource instanceof Room room)) {
            throw new IllegalArgumentException("회의실 자원이 아닙니다.");
        }

        // 공통 필드 수정
        room.update(dto.getName(), dto.getLocation(), dto.getMinPosition());
        // 회의실 고유 필드 수정
        room.updateRoomDetails(dto.getCapacity(), dto.isHasBoard());

        return RoomResponseDto.from(room);
    }

    // 관리자 - 장비 수정
    @Transactional
    public EquipmentResponseDto updateEquipment(Integer id, EquipmentRequestDto dto) {
        validateEquipmentRequest(dto);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        // Equipment 타입 검증
        if (!(resource instanceof Equipment equipment)) {
            throw new IllegalArgumentException("장비 자원이 아닙니다.");
        }

        // 공통 필드 수정
        equipment.update(dto.getName(), dto.getLocation(), dto.getMinPosition());
        // 장비 고유 필드 수정
        equipment.updateEquipmentDetails(dto.getModelName(), dto.getSerialNumber());

        return EquipmentResponseDto.from(equipment);
    }

    // 관리자 - 자원 삭제
    @Transactional
    public void deleteResource(Integer id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        resourceRepository.delete(resource);
    }

    // =====================
    // 공통 - 전체 자원 목록 조회
    // =====================
    public List<Object> getAllResources() {
        List<Resource> resources = resourceRepository.findAll();

        // instanceof로 타입 체크 후 각각 다른 DTO로 변환
        return resources.stream()
                .map(resource -> {
                    if (resource instanceof Room room) {
                        return (Object) RoomResponseDto.from(room);
                    } else if (resource instanceof Equipment equipment) {
                        return (Object) EquipmentResponseDto.from(equipment);
                    }
                    throw new IllegalStateException("알 수 없는 자원 타입입니다.");
                })
                .collect(Collectors.toList());
    }

    // 공통 - 특정 자원 상세 조회
    public Object getResource(Integer id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        if (resource instanceof Room room) {
            return RoomResponseDto.from(room);
        } else if (resource instanceof Equipment equipment) {
            return EquipmentResponseDto.from(equipment);
        }
        throw new IllegalStateException("알 수 없는 자원 타입입니다.");
    }

    // =====================
    // 검증 메서드
    // =====================
    private void validateRoomRequest(RoomRequestDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("자원명을 입력해주세요.");
        }
        if (dto.getLocation() == null || dto.getLocation().isBlank()) {
            throw new IllegalArgumentException("위치를 입력해주세요.");
        }
        if (dto.getMinPosition() == null) {
            throw new IllegalArgumentException("최소 예약 직급을 선택해주세요.");
        }
        if (dto.getCapacity() < 1) {
            throw new IllegalArgumentException("수용 인원은 1명 이상이어야 합니다.");
        }
    }

    private void validateEquipmentRequest(EquipmentRequestDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("자원명을 입력해주세요.");
        }
        if (dto.getLocation() == null || dto.getLocation().isBlank()) {
            throw new IllegalArgumentException("위치를 입력해주세요.");
        }
        if (dto.getMinPosition() == null) {
            throw new IllegalArgumentException("최소 예약 직급을 선택해주세요.");
        }
        if (dto.getModelName() == null || dto.getModelName().isBlank()) {
            throw new IllegalArgumentException("모델명을 입력해주세요.");
        }
        if (dto.getSerialNumber() == null || dto.getSerialNumber().isBlank()) {
            throw new IllegalArgumentException("시리얼 번호를 입력해주세요.");
        }
    }
}