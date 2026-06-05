import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ReservationPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchReservations = async () => {
      try {
        const res = await api.get("/reservations/me");
        setReservations(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("예약을 취소하시겠습니까?")) return;
    try {
      await api.delete(`/reservations/${id}`);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELED" } : r)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "예약 취소에 실패했습니다.");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div style={styles.loading}>불러오는 중...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>내 예약 내역</h2>

      {error && <p style={styles.error}>{error}</p>}

      {reservations.length === 0 ? (
        <div style={styles.empty}>
          <p>예약 내역이 없습니다.</p>
          <button style={styles.goBtn} onClick={() => navigate("/")}>
            자원 예약하러 가기
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {reservations.map((r) => (
            <div key={r.id} style={styles.card}>
              <div style={styles.cardLeft}>
                <div style={styles.cardTop}>
                  <span style={styles.resourceName}>{r.resourceName}</span>
                  <span
                    style={
                      r.status === "RESERVED"
                        ? styles.badgeReserved
                        : styles.badgeCanceled
                    }
                  >
                    {r.status === "RESERVED" ? "✅ 예약중" : "❌ 취소됨"}
                  </span>
                </div>
                <p style={styles.info}>📍 {r.resourceLocation}</p>
                <p style={styles.info}>
                  🕐 {formatDate(r.startTime)} ~ {formatDate(r.endTime)}
                </p>
              </div>
              {r.status === "RESERVED" && (
                <button
                  style={styles.cancelBtn}
                  onClick={() => handleCancel(r.id)}
                >
                  취소
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "32px" },
  title: { fontSize: "22px", marginBottom: "24px", color: "#333" },
  loading: { padding: "40px", textAlign: "center", color: "#888" },
  error: { color: "#e74c3c", marginBottom: "16px" },
  empty: { textAlign: "center", padding: "60px", color: "#888" },
  goBtn: {
    marginTop: "16px",
    padding: "10px 24px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
  },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: { display: "flex", flexDirection: "column", gap: "6px" },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "4px",
  },
  resourceName: { fontSize: "16px", fontWeight: "bold", color: "#222" },
  badgeReserved: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
  },
  badgeCanceled: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
  },
  info: { fontSize: "13px", color: "#666" },
  cancelBtn: {
    padding: "8px 18px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
  },
};
