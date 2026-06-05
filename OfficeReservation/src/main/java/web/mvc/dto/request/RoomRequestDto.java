package web.mvc.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import web.mvc.domain.resource.Room;
import web.mvc.domain.user.Position;

@Getter
@NoArgsConstructor
public class RoomRequestDto {

    private String name;
    private String location;
    private Position minPosition;
    private int capacity;
    private boolean hasBoard;

    public Room toEntity() {
        return Room.builder()
                .name(this.name)
                .location(this.location)
                .minPosition(this.minPosition)
                .capacity(this.capacity)
                .hasBoard(this.hasBoard)
                .build();
    }
}