import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const getImageSrc = (imageUrl) =>
  imageUrl || "";

export default function ResourcePage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [form, setForm] = useState({ startTime: "", endTime: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchResources = async () => {
      try {
        const res = await api.get("/resources");
        setResources(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [navigate]);

  const handleReserve = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.startTime >= form.endTime) {
      setError("시작 시간은 종료 시간보다 빨라야 합니다.");
      return;
    }

    try {
      await api.post("/reservations", {
        resourceId: selectedResource.id,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setSuccess("예약이 완료되었습니다.");
      setSelectedResource(null);
      setForm({ startTime: "", endTime: "" });
    } catch (err) {
      setError(err.response?.data?.message || "예약에 실패했습니다.");
    }
  };

  const closeModal = () => {
    setSelectedResource(null);
    setError("");
    setForm({ startTime: "", endTime: "" });
  };

  if (loading) return <div style={styles.loading}>불러오는 중...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.title}>자원 예약</h2>
          <p style={styles.subtitle}>회의실과 장비를 숙소를 고르듯 비교하고 예약하세요.</p>
        </div>
      </div>

      {success && <p style={styles.success}>{success}</p>}

      <div style={styles.resourceList}>
        {resources.map((resource) => (
          <article key={resource.id} style={styles.resourceCard}>
            <div style={styles.resourceImageBox}>
              {resource.imageUrl ? (
                <img
                  src={getImageSrc(resource.imageUrl)}
                  alt={resource.name}
                  style={styles.image}
                />
              ) : (
                <span style={styles.noImage}>이미지 없음</span>
              )}
            </div>

            <div style={styles.resourceBody}>
              <div style={styles.resourceTopLine}>
                <span
                  style={{
                    ...styles.resourceBadge,
                    backgroundColor:
                      resource.dtype === "ROOM" ? "#eff6ff" : "#f0fdf4",
                    color: resource.dtype === "ROOM" ? "#1d4ed8" : "#15803d",
                  }}
                >
                  {resource.dtype === "ROOM" ? "회의실" : "장비"}
                </span>
                <span style={styles.resourceLocation}>{resource.location}</span>
              </div>
              <h3 style={styles.resourceName}>{resource.name}</h3>
              <div style={styles.resourceMeta}>
                <span>최소 직급 {resource.minPosition}</span>
                {resource.dtype === "ROOM" ? (
                  <>
                    <span>{resource.capacity}명 이용</span>
                    <span>{resource.hasBoard ? "화이트보드 있음" : "화이트보드 없음"}</span>
                  </>
                ) : (
                  <>
                    <span>{resource.modelName}</span>
                    <span>{resource.serialNumber}</span>
                  </>
                )}
              </div>
              <p style={styles.resourceDesc}>
                원하는 시간대를 선택하면 즉시 예약 가능 여부를 확인합니다.
              </p>
            </div>

            <div style={styles.reservePanel}>
              <p style={styles.panelLabel}>오늘 예약 가능</p>
              <button
                style={styles.reserveBtn}
                onClick={() => {
                  setSelectedResource(resource);
                  setError("");
                }}
              >
                예약하기
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedResource && (
        <div style={styles.overlay}>
          <div style={styles.bookingModal}>
            <div style={styles.modalMedia}>
              {selectedResource.imageUrl ? (
                <img
                  src={getImageSrc(selectedResource.imageUrl)}
                  alt={selectedResource.name}
                  style={styles.image}
                />
              ) : (
                <span style={styles.noImage}>이미지 없음</span>
              )}
            </div>

            <form style={styles.modalContent} onSubmit={handleReserve}>
              <div style={styles.modalHeader}>
                <div>
                  <p style={styles.modalEyebrow}>
                    {selectedResource.dtype === "ROOM" ? "회의실 예약" : "장비 예약"}
                  </p>
                  <h3 style={styles.modalTitle}>{selectedResource.name}</h3>
                  <p style={styles.modalLocation}>{selectedResource.location}</p>
                </div>
                <button type="button" style={styles.closeBtn} onClick={closeModal}>
                  ×
                </button>
              </div>

              <div style={styles.modalSummary}>
                <span>최소 직급 {selectedResource.minPosition}</span>
                {selectedResource.dtype === "ROOM" ? (
                  <>
                    <span>{selectedResource.capacity}명</span>
                    <span>
                      {selectedResource.hasBoard ? "화이트보드 있음" : "화이트보드 없음"}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{selectedResource.modelName}</span>
                    <span>{selectedResource.serialNumber}</span>
                  </>
                )}
              </div>

              <div style={styles.dateBox}>
                <div style={styles.field}>
                  <label style={styles.label}>시작 시간</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>종료 시간</label>
                  <input
                    style={styles.input}
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {error && <p style={styles.error}>{error}</p>}

              <div style={styles.modalActions}>
                <button style={styles.cancelBtn} type="button" onClick={closeModal}>
                  취소
                </button>
                <button style={styles.confirmBtn} type="submit">
                  예약 확정
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1040px",
    margin: "40px auto",
    padding: "0 24px",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "22px",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    color: "#111827",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },
  loading: { padding: "40px", textAlign: "center", color: "#888" },
  success: {
    color: "#166534",
    backgroundColor: "#dcfce7",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "10px 12px",
    marginBottom: "16px",
    fontWeight: "bold",
  },
  resourceList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  resourceCard: {
    display: "grid",
    gridTemplateColumns: "240px 1fr 136px",
    gap: "18px",
    alignItems: "stretch",
    backgroundColor: "#fff",
    border: "1px solid #dbe3ef",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 2px 12px rgba(15, 23, 42, 0.05)",
  },
  resourceImageBox: {
    minHeight: "158px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  resourceBody: {
    minWidth: 0,
    padding: "4px 0",
  },
  resourceTopLine: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  resourceBadge: {
    fontSize: "12px",
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  resourceLocation: {
    color: "#64748b",
    fontSize: "13px",
  },
  resourceName: {
    margin: "0 0 12px",
    fontSize: "21px",
    lineHeight: 1.25,
    color: "#111827",
  },
  resourceMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    color: "#475569",
    fontSize: "13px",
  },
  resourceDesc: {
    margin: "14px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  reservePanel: {
    borderLeft: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: "10px",
    paddingLeft: "12px",
  },
  panelLabel: {
    margin: 0,
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "right",
  },
  reserveBtn: {
    padding: "10px 0",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.52)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    zIndex: 1000,
  },
  bookingModal: {
    width: "min(860px, 100%)",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
  },
  modalMedia: {
    minHeight: "430px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    padding: "26px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "14px",
  },
  modalEyebrow: {
    margin: "0 0 4px",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "bold",
  },
  modalTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "24px",
  },
  modalLocation: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    color: "#64748b",
    fontSize: "20px",
    cursor: "pointer",
  },
  modalSummary: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    borderTop: "1px solid #e5e7eb",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 0",
    marginBottom: "18px",
    color: "#475569",
    fontSize: "13px",
  },
  dateBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    color: "#4b5563",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    margin: "12px 0 0",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "22px",
  },
  cancelBtn: {
    padding: "10px 16px",
    backgroundColor: "#fff",
    color: "#4b5563",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  confirmBtn: {
    padding: "10px 18px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
