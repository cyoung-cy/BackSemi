import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import ImageUploadModal from "../components/ImageUploadModal";
export default function AdminPage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageModalResource, setImageModalResource] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/reservations");
      setReservations(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/resources");
      setResources(res.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer fetch calls to avoid synchronous setState inside effect
    if (tab === "users") Promise.resolve().then(() => fetchUsers());
    if (tab === "reservations")
      Promise.resolve().then(() => fetchReservations());
    if (tab === "resources") Promise.resolve().then(() => fetchResources());
  }, [tab, fetchUsers, fetchReservations, fetchResources]);

  const handlePositionChange = async (userId, position) => {
    try {
      await api.put(`/admin/users/${userId}/position`, { position });
      fetchUsers();
    } catch {
      alert("직급 변경에 실패했습니다.");
    }
  };

  const handleForceCancel = async (id) => {
    if (!window.confirm("정말 강제 취소하시겠습니까?")) return;
    try {
      await api.delete(`/admin/reservations/${id}`);
      fetchReservations();
    } catch {
      alert("예약 취소에 실패했습니다.");
    }
  };

  const formatTime = (t) => {
    if (!Array.isArray(t)) return "";

    const [y, m, d, h, min] = t;

    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  };
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>관리자 페이지</h2>

      {/* 탭 */}
      <div style={styles.tabBar}>
        {[
          { key: "users", label: "유저 관리" },
          { key: "reservations", label: "전체 예약" },
          { key: "resources", label: "자원 이미지" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...styles.tabBtn,
              borderBottom:
                tab === t.key ? "2px solid #4f46e5" : "2px solid transparent",
              color: tab === t.key ? "#4f46e5" : "#6b7280",
              fontWeight: tab === t.key ? "bold" : "normal",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={styles.empty}>불러오는 중...</p>
      ) : (
        <>
          {/* 유저 관리 탭 */}
          {tab === "users" && (
            <div style={styles.list}>
              {users.map((u) => (
                <div key={u.id} style={styles.card}>
                  <div>
                    <p style={styles.cardName}>
                      {u.name}
                      <span style={styles.email}>{u.email}</span>
                    </p>
                    <p style={styles.sub}>
                      {u.provider} · {u.role}
                    </p>
                  </div>
                  <select
                    value={u.position}
                    onChange={(e) => handlePositionChange(u.id, e.target.value)}
                    style={styles.select}
                  >
                    <option value="ASSISTANT">ASSISTANT</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="EXECUTIVE">EXECUTIVE</option>
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* 전체 예약 탭 */}
          {tab === "reservations" && (
            <div style={styles.list}>
              {reservations.map((r) => (
                <div
                  key={r.id}
                  style={{
                    ...styles.card,
                    opacity: r.status === "CANCELED" ? 0.5 : 1,
                  }}
                >
                  <div>
                    <div style={styles.cardHeader}>
                      <span style={styles.cardName}>{r.resourceName}</span>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor:
                            r.status === "RESERVED" ? "#d1fae5" : "#f3f4f6",
                          color:
                            r.status === "RESERVED" ? "#065f46" : "#6b7280",
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p style={styles.sub}>
                      {r.userName} · {formatTime(r.startTime)} ~{" "}
                      {formatTime(r.endTime)?.slice(11)}
                    </p>
                  </div>
                  {r.status === "RESERVED" && (
                    <button
                      style={styles.cancelBtn}
                      onClick={() => handleForceCancel(r.id)}
                    >
                      강제 취소
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 자원 이미지 탭 */}
          {tab === "resources" && (
            <div style={styles.grid}>
              {resources.map((r) => (
                <div key={r.id} style={styles.resourceCard}>
                  <div style={styles.imageBox}>
                    {r.imageUrl ? (
                      <img
                        src={`http://localhost:8080${r.imageUrl}`}
                        alt={r.name}
                        style={styles.image}
                      />
                    ) : (
                      <span style={styles.noImage}>이미지 없음</span>
                    )}
                  </div>
                  <div style={styles.resourceInfo}>
                    <p style={styles.resourceName}>{r.name}</p>
                    <p style={styles.dtype}>{r.dtype}</p>
                    <button
                      style={styles.uploadBtn}
                      onClick={() => setImageModalResource(r)}
                    >
                      {r.imageUrl ? "이미지 변경" : "이미지 업로드"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {imageModalResource && (
        <ImageUploadModal
          resource={imageModalResource}
          onClose={() => {
            setImageModalResource(null);
            fetchResources();
          }}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "960px",
    margin: "40px auto",
    padding: "0 24px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "24px",
  },
  tabBar: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "24px",
  },
  tabBtn: {
    padding: "10px 20px",
    background: "none",
    border: "none",
    fontSize: "14px",
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
    marginTop: "60px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "14px 20px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cardName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  email: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "normal",
  },
  sub: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#6b7280",
  },
  badge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  select: {
    fontSize: "13px",
    padding: "6px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  resourceCard: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
  },
  imageBox: {
    height: "130px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
  resourceInfo: {
    padding: "12px",
  },
  resourceName: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "bold",
    color: "#333",
  },
  dtype: {
    margin: "2px 0 8px",
    fontSize: "11px",
    color: "#9ca3af",
  },
  uploadBtn: {
    width: "100%",
    padding: "7px 0",
    backgroundColor: "#fff",
    color: "#4f46e5",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
  },
};
