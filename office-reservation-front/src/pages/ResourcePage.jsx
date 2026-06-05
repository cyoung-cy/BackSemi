import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ResourcePage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [form, setForm] = useState({ startTime: "", endTime: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // fetchResources를 useEffect 위로 올리기const fetchResources = async () => {
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
  }, []);

  const handleReserve = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/reservations", {
        resourceId: selectedResource.id,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setSuccess("예약이 완료되었습니다!");
      setSelectedResource(null);
      setForm({ startTime: "", endTime: "" });
    } catch (err) {
      setError(err.response?.data?.message || "예약에 실패했습니다.");
    }
  };

  if (loading) return <div style={styles.loading}>불러오는 중...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>자원 목록</h2>

      {success && <p style={styles.success}>{success}</p>}

      <div style={styles.grid}>
        {resources.map((r) => (
          <div key={r.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span
                style={
                  r.dtype === "ROOM" ? styles.badgeRoom : styles.badgeEquip
                }
              >
                {r.dtype === "ROOM" ? "🏠 회의실" : "💻 장비"}
              </span>
            </div>
            <h3 style={styles.cardTitle}>{r.name}</h3>
            <p style={styles.cardInfo}>📍 {r.location}</p>
            <p style={styles.cardInfo}>🔒 최소 직급: {r.minPosition}</p>
            {r.dtype === "ROOM" && (
              <>
                <p style={styles.cardInfo}>👥 수용 인원: {r.capacity}명</p>
                <p style={styles.cardInfo}>
                  📋 화이트보드: {r.hasBoard ? "있음" : "없음"}
                </p>
              </>
            )}
            {r.dtype === "EQUIPMENT" && (
              <>
                <p style={styles.cardInfo}>🖥️ 모델: {r.modelName}</p>
                <p style={styles.cardInfo}>🔢 시리얼: {r.serialNumber}</p>
              </>
            )}
            <button
              style={styles.reserveBtn}
              onClick={() => setSelectedResource(r)}
            >
              예약하기
            </button>
          </div>
        ))}
      </div>

      {/* 예약 모달 */}
      {selectedResource && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>📅 {selectedResource.name} 예약</h3>
            <form onSubmit={handleReserve}>
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
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  required
                />
              </div>
              {error && <p style={styles.error}>{error}</p>}
              <div style={styles.modalButtons}>
                <button
                  style={styles.cancelBtn}
                  type="button"
                  onClick={() => {
                    setSelectedResource(null);
                    setError("");
                  }}
                >
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
  container: { padding: "32px" },
  title: { fontSize: "22px", marginBottom: "24px", color: "#333" },
  loading: { padding: "40px", textAlign: "center", color: "#888" },
  success: { color: "#16a34a", marginBottom: "16px", fontWeight: "bold" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  cardHeader: { marginBottom: "12px" },
  badgeRoom: {
    backgroundColor: "#ede9fe",
    color: "#7c3aed",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
  },
  badgeEquip: {
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#222",
  },
  cardInfo: { fontSize: "13px", color: "#666", marginBottom: "6px" },
  reserveBtn: {
    marginTop: "14px",
    width: "100%",
    padding: "10px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px",
    width: "400px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },
  modalTitle: { fontSize: "18px", marginBottom: "20px", color: "#333" },
  field: { marginBottom: "16px" },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  error: { color: "#e74c3c", fontSize: "13px", marginBottom: "12px" },
  modalButtons: { display: "flex", gap: "12px", marginTop: "8px" },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
  },
  confirmBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
  },
};
