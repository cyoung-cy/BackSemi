import { useState } from "react";
import api from "../api/axios";

const normalizeToHalfHour = (value) => {
  if (!value) return "";

  const [date, time] = value.split("T");
  if (!date || !time) return value;

  const [hour, minute] = time.split(":");
  if (!hour || minute === undefined) return value;

  return `${date}T${hour}:${Number(minute) < 30 ? "00" : "30"}`;
};

const isHalfHourTime = (value) => {
  if (!value) return false;

  const minute = value.split("T")[1]?.split(":")[1];
  return minute === "00" || minute === "30";
};

export default function UpdateReservationModal({ reservation, onClose }) {
  const [startTime, setStartTime] = useState(
    reservation.startTime?.slice(0, 16),
  );
  const [endTime, setEndTime] = useState(reservation.endTime?.slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    if (!startTime || !endTime) {
      setError("시작 시간과 종료 시간을 입력해주세요.");
      return;
    }
    if (!isHalfHourTime(startTime) || !isHalfHourTime(endTime)) {
      setError("예약 시간은 30분 단위로 선택해주세요.");
      return;
    }
    if (startTime >= endTime) {
      setError("시작 시간은 종료 시간보다 빨라야 합니다.");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/reservations/${reservation.id}`, {
        startTime: startTime + ":00",
        endTime: endTime + ":00",
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "예약 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>예약 수정</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <p style={styles.resourceInfo}>
          {reservation.resourceName} · {reservation.resourceLocation}
        </p>

        <div style={styles.field}>
          <label style={styles.label}>시작 시간</label>
          <input
            style={styles.input}
            type="datetime-local"
            step="1800"
            value={startTime}
            onChange={(e) => setStartTime(normalizeToHalfHour(e.target.value))}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>종료 시간</label>
          <input
            style={styles.input}
            type="datetime-local"
            step="1800"
            value={endTime}
            onChange={(e) => setEndTime(normalizeToHalfHour(e.target.value))}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.btnRow}>
          <button style={styles.cancelBtn} onClick={onClose}>
            닫기
          </button>
          <button
            style={styles.submitBtn}
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "수정 중..." : "수정 완료"}
          </button>
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
    width: "360px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
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
  resourceInfo: {
    margin: "0 0 20px",
    fontSize: "13px",
    color: "#6b7280",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#555",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  error: {
    color: "#ef4444",
    fontSize: "13px",
    marginBottom: "12px",
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#fff",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
};
