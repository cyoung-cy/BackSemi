package web.mvc.dto.response;

import lombok.Builder;
import lombok.Getter;
import web.mvc.domain.resource.Room;
import web.mvc.domain.user.Position;

@Getter
@Builder
public class RoomResponseDto {

    private Integer id;
    private String name;
    private String location;
    private Position minPosition;
    private int capacity;
    private boolean hasBoard;
    private String imageUrl;   // 추가
    private String dtype;

    public static RoomResponseDto from(Room room) {
        return RoomResponseDto.builder()
                .id(room.getId())
                .name(room.getName())
                .location(room.getLocation())
                .minPosition(room.getMinPosition())
                .capacity(room.getCapacity())
                .hasBoard(room.isHasBoard())
                .imageUrl(room.getImageUrl())   // 추가
                .dtype("ROOM")
                .build();
    }
}