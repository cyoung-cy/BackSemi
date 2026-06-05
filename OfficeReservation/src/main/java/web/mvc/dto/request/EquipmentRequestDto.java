package web.mvc.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import web.mvc.domain.resource.Equipment;
import web.mvc.domain.user.Position;

@Getter
@NoArgsConstructor
public class EquipmentRequestDto {

    private String name;
    private String location;
    private Position minPosition;
    private String modelName;
    private String serialNumber;

    public Equipment toEntity() {
        return Equipment.builder()
                .name(this.name)
                .location(this.location)
                .minPosition(this.minPosition)
                .modelName(this.modelName)
                .serialNumber(this.serialNumber)
                .build();
    }
}