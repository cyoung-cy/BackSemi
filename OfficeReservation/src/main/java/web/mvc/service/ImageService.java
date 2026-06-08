package web.mvc.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import web.mvc.domain.resource.Resource;
import web.mvc.dto.response.ImageUploadResponseDto;
import web.mvc.repository.ResourceRepository;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ImageService {

    private final ResourceRepository resourceRepository;

    @Value("${file.upload.path:/app/uploads/images/resources/}")
    private String imageDir;

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "jpg", "jpeg", "png", "webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    @Transactional
    public ImageUploadResponseDto uploadImage(Integer resourceId, MultipartFile file) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        validateImageFile(file);

        File dir = new File(imageDir);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new RuntimeException("이미지 저장 폴더를 생성하지 못했습니다.");
        }

        String extension = getExtension(file.getOriginalFilename()).toLowerCase();
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String fileName = resourceId + "_" + timestamp + "." + extension;

        try {
            File dest = new File(dir, fileName);
            file.transferTo(dest.getAbsoluteFile());
        } catch (IOException e) {
            throw new RuntimeException("이미지 저장에 실패했습니다.", e);
        }

        String imageUrl = "/images/resources/" + fileName;
        resource.updateImageUrl(imageUrl);

        return ImageUploadResponseDto.of(resource.getId(), resource.getName(), imageUrl);
    }

    @Transactional
    public void deleteImage(Integer resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        if (resource.getImageUrl() == null) {
            throw new IllegalArgumentException("등록된 이미지가 없습니다.");
        }

        String imageUrl = resource.getImageUrl();
        String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        File file = new File(imageDir, fileName);
        if (file.exists() && !file.delete()) {
            throw new RuntimeException("이미지 파일 삭제에 실패했습니다.");
        }

        resource.deleteImageUrl();
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일을 선택해주세요.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다.");
        }
        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다. (jpg, jpeg, png, webp)");
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new IllegalArgumentException("올바른 파일명이 아닙니다.");
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}
