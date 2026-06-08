import { useEffect, useState } from "react";
import api from "../api/axios";
import UpdateReservationModal from "../components/UpdateReservationModal";

export default function MyReservationPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateTarget, setUpdateTarget] = useState(null);

  useEffect(() => {
    fetchMyReservations();
  }, []);

  async function fetchMyReservations() {
    setLoading(true);
    try {
      const res = await api.get("/reservations/me");
      setReservations(res.data.data);
    } catch {
      alert("예약 내역을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm("예약을 취소하시겠습니까?")) return;
    try {
      await api.delete(`/reservations/${id}`);
      fetchMyReservations();
    } catch (err) {
      alert(err.response?.data?.message || "예약 취소에 실패했습니다.");
    }
  };

  const formatTime = (t) => t?.replace("T", " ").slice(0, 16);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>내 예약 내역</h2>

      {loading ? (
        <p style={styles.empty}>불러오는 중...</p>
      ) : reservations.length === 0 ? (
        <p style={styles.empty}>예약 내역이 없습니다.</p>
      ) : (
        <div style={styles.list}>
          {reservations.map((r) => (
            <div
              key={r.id}
              style={{
                ...styles.card,
                opacity: r.status === "CANCELED" ? 0.5 : 1,
              }}
            >
              <div style={styles.cardLeft}>
                <div style={styles.cardHeader}>
                  <span style={styles.resourceName}>{r.resourceName}</span>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor:
                        r.status === "RESERVED" ? "#d1fae5" : "#f3f4f6",
                      color: r.status === "RESERVED" ? "#065f46" : "#6b7280",
                    }}
                  >
                    {r.status === "RESERVED" ? "예약중" : "취소됨"}
                  </span>
                </div>
                <p style={styles.location}>{r.resourceLocation}</p>
                <p style={styles.time}>
                  {formatTime(r.startTime)} ~ {formatTime(r.endTime)?.slice(11)}
                </p>
              </div>

              {r.status === "RESERVED" && (
                <div style={styles.cardRight}>
                  <button
                    style={styles.editBtn}
                    onClick={() => setUpdateTarget(r)}
                  >
                    수정
                  </button>
                  <button
                    style={styles.cancelBtn}
                    onClick={() => handleCancel(r.id)}
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {updateTarget && (
        <UpdateReservationModal
          reservation={updateTarget}
          onClose={() => {
            setUpdateTarget(null);
            fetchMyReservations();
          }}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "720px",
    margin: "40px auto",
    padding: "0 24px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "24px",
  },
  empty: {
    color: "#999",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "60px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px 20px",
  },
  cardLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  resourceName: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333",
  },
  badge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  location: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },
  time: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },
  cardRight: {
    display: "flex",
    gap: "8px",
  },
  editBtn: {
    padding: "6px 14px",
    backgroundColor: "#fff",
    color: "#4f46e5",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "6px 14px",
    backgroundColor: "#fff",
    color: "#ef4444",
    border: "1px solid #ef4444",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
};
