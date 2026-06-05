package web.mvc.domain.resource;

import jakarta.persistence.*;
import lombok.*;
import web.mvc.domain.user.Position;

@Entity
@Table(name = "room")
@DiscriminatorValue("ROOM")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Room extends Resource {

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Column(name = "has_board", nullable = false)
    private boolean hasBoard;

    @Builder
    public Room(String name, String location, Position minPosition,
                int capacity, boolean hasBoard) {
        super(name, location, minPosition);
        this.capacity = capacity;
        this.hasBoard = hasBoard;
    }

    // 회의실 고유 정보 수정
    public void updateRoomDetails(int capacity, boolean hasBoard) {
        this.capacity = capacity;
        this.hasBoard = hasBoard;
    }
}