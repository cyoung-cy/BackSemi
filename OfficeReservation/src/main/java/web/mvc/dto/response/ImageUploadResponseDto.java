package web.mvc.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImageUploadResponseDto {

    private Integer id;
    private String name;
    private String imageUrl;

    public static ImageUploadResponseDto of(Integer id, String name, String imageUrl) {
        return ImageUploadResponseDto.builder()
                .id(id)
                .name(name)
                .imageUrl(imageUrl)
                .build();
    }
}