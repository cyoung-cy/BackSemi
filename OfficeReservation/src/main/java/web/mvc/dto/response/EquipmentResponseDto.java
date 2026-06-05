package web.mvc.dto.response;

import lombok.Builder;
import lombok.Getter;
import web.mvc.domain.resource.Equipment;
import web.mvc.domain.user.Position;

@Getter
@Builder
public class EquipmentResponseDto {

    private Integer id;
    private String name;
    private String location;
    private Position minPosition;
    private String modelName;
    private String serialNumber;
    private String imageUrl;   // 추가
    private String dtype;

    public static EquipmentResponseDto from(Equipment equipment) {
        return EquipmentResponseDto.builder()
                .id(equipment.getId())
                .name(equipment.getName())
                .location(equipment.getLocation())
                .minPosition(equipment.getMinPosition())
                .modelName(equipment.getModelName())
                .serialNumber(equipment.getSerialNumber())
                .imageUrl(equipment.getImageUrl())   // 추가
                .dtype("EQUIPMENT")
                .build();
    }
}