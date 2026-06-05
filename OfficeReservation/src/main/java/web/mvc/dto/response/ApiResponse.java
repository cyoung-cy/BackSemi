package web.mvc.dto.response;

import lombok.Getter;

/**
 *  모든 응답을 `ApiResponse`로 감싸서 일관된 JSON 구조 유지
 */
@Getter
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;

    private ApiResponse(boolean success, T data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    // 성공 응답 - 데이터 있음
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, "요청이 성공적으로 처리되었습니다.");
    }

    // 성공 응답 - 커스텀 메시지
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    // 성공 응답 - 데이터 없음 (삭제, 취소 등)
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, null, message);
    }

    // 실패 응답
    public static <T> ApiResponse<T> fail(String message) {
        return new ApiResponse<>(false, null, message);
    }
}