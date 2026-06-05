package web.mvc.domain.resource;

import jakarta.persistence.*;
import lombok.*;
import web.mvc.domain.user.Position;

@Entity
@Table(name = "equipment")
@DiscriminatorValue("EQUIPMENT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Equipment extends Resource {

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "serial_number", nullable = false, unique = true, length = 100)
    private String serialNumber;

    @Builder
    public Equipment(String name, String location, Position minPosition,
                     String modelName, String serialNumber) {
        super(name, location, minPosition);
        this.modelName = modelName;
        this.serialNumber = serialNumber;
    }

    // 장비 고유 정보 수정
    public void updateEquipmentDetails(String modelName, String serialNumber) {
        this.modelName = modelName;
        this.serialNumber = serialNumber;
    }
}