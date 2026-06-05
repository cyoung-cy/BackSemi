import { useState } from "react";
import api from "../api/axios";

export default function ImageUploadModal({ resource, onClose }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(selected.type)) {
      setError("jpg, png, webp 파일만 업로드 가능합니다.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB를 초과할 수 없습니다.");
      return;
    }

    setError("");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) {
      setError("파일을 선택해주세요.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await api.post(`/admin/resources/${resource.id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "업로드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이미지를 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/admin/resources/${resource.id}/image`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>{resource.name} 이미지 관리</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.imagePreview}>
          {preview ? (
            <img src={preview} alt="preview" style={styles.previewImg} />
          ) : resource.imageUrl ? (
            <img
              src={`http://localhost:8080${resource.imageUrl}`}
              alt={resource.name}
              style={styles.previewImg}
            />
          ) : (
            <span style={styles.noImage}>이미지 없음</span>
          )}
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={styles.fileInput}
        />

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.btnRow}>
          <button
            style={styles.uploadBtn}
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "업로드 중..." : "업로드"}
          </button>
          {resource.imageUrl && (
            <button style={styles.deleteBtn} onClick={handleDelete}>
              이미지 삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "28px",
    width: "380px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#9ca3af",
  },
  imagePreview: {
    height: "160px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    fontSize: "13px",
    color: "#9ca3af",
  },
  fileInput: {
    fontSize: "13px",
    marginBottom: "12px",
    color: "#555",
  },
  error: {
    color: "#ef4444",
    fontSize: "13px",
    marginBottom: "12px",
  },
  btnRow: {
    display: "flex",
    gap: "8px",
  },
  uploadBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "10px 16px",
    backgroundColor: "#fff",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
};
