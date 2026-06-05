package web.mvc.service;

import lombok.RequiredArgsConstructor;
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

    // 이미지 저장 경로 (서버 로컬)
    private static final String IMAGE_DIR = "src/main/resources/static/images/resources/";

    // 허용 확장자
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            "jpg", "jpeg", "png", "webp"
    );

    // 최대 파일 크기 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    // 이미지 업로드
    @Transactional
    public ImageUploadResponseDto uploadImage(Integer resourceId, MultipartFile file) {

        // 1. 자원 조회
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        // 2. 파일 유효성 검증
        validateImageFile(file);

        // 3. 저장 디렉토리 생성
        File dir = new File(IMAGE_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 4. 파일명 생성 (resourceId_yyyyMMddHHmmss.확장자)
        String extension = getExtension(file.getOriginalFilename());
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String fileName = resourceId + "_" + timestamp + "." + extension;

        // 5. 파일 저장
        try {
            File dest = new File(IMAGE_DIR + fileName);
            file.transferTo(dest);
        } catch (IOException e) {
            e.printStackTrace(); // 추가

            throw new RuntimeException("이미지 저장에 실패했습니다.");
        }

        // 6. DB에 URL 업데이트
        String imageUrl = "/images/resources/" + fileName;
        resource.updateImageUrl(imageUrl);

        return ImageUploadResponseDto.of(resource.getId(), resource.getName(), imageUrl);
    }

    // 이미지 삭제
    @Transactional
    public void deleteImage(Integer resourceId) {

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 자원입니다."));

        if (resource.getImageUrl() == null) {
            throw new IllegalArgumentException("등록된 이미지가 없습니다.");
        }

        // 로컬 파일 삭제
        String filePath = "src/main/resources/static" + resource.getImageUrl();
        File file = new File(filePath);
        if (file.exists()) {
            file.delete();
        }

        // DB URL 초기화
        resource.deleteImageUrl();
    }

    // 파일 유효성 검증
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일을 선택해주세요.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기는 5MB를 초과할 수 없습니다.");
        }
        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다. (jpg, jpeg, png, webp)");
        }
    }

    // 확장자 추출
    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new IllegalArgumentException("올바른 파일명이 아닙니다.");
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}