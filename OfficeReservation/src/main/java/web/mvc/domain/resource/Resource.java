package web.mvc.domain.resource;


import jakarta.persistence.*;
import lombok.*;
import web.mvc.domain.BaseTimeEntity;
import web.mvc.domain.user.Position;

@Entity
@Table(name = "resource")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class Resource extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Integer id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "location", nullable = false, length = 100)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "min_position", nullable = false, length = 15)
    private Position minPosition;

    @Column(name = "image_url", nullable = true, length = 500)
    private String imageUrl;

    // 이미지 URL 업데이트
    public void updateImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // 이미지 삭제
    public void deleteImageUrl() {
        this.imageUrl = null;
    }

    // 하위 클래스에서 Builder 사용을 위한 생성자
    protected Resource(String name, String location, Position minPosition) {
        this.name = name;
        this.location = location;
        this.minPosition = minPosition;
    }

    // 자원 정보 수정 (관리자용)
    public void update(String name, String location, Position minPosition) {
        this.name = name;
        this.location = location;
        this.minPosition = minPosition;
    }
}