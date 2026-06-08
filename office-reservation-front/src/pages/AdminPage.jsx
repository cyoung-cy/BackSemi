import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";

const initialResourceForm = {
  dtype: "ROOM",
  name: "",
  location: "",
  minPosition: "ASSISTANT",
  capacity: 1,
  hasBoard: false,
  modelName: "",
  serialNumber: "",
};

const minPositions = ["ASSISTANT", "MANAGER", "EXECUTIVE"];

const getImageSrc = (imageUrl) =>
  imageUrl || "";

export default function AdminPage() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resourceForm, setResourceForm] = useState(initialResourceForm);
  const [resourceImage, setResourceImage] = useState(null);
  const [resourcePreview, setResourcePreview] = useState("");
  const [editingResource, setEditingResource] = useState(null);
  const [editForm, setEditForm] = useState(initialResourceForm);
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceMessage, setResourceMessage] = useState("");
  const [resourceError, setResourceError] = useState("");

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
    if (tab === "users") Promise.resolve().then(() => fetchUsers());
    if (tab === "reservations") Promise.resolve().then(() => fetchReservations());
    if (tab === "resources") Promise.resolve().then(() => fetchResources());
  }, [tab, fetchUsers, fetchReservations, fetchResources]);

  useEffect(() => {
    return () => {
      if (resourcePreview) URL.revokeObjectURL(resourcePreview);
      if (editPreview) URL.revokeObjectURL(editPreview);
    };
  }, [resourcePreview, editPreview]);

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

  const getResourceEndpoint = (form) =>
    form.dtype === "ROOM" ? "/admin/resources/rooms" : "/admin/resources/equipments";

  const getResourcePayload = (form) =>
    form.dtype === "ROOM"
      ? {
          name: form.name,
          location: form.location,
          minPosition: form.minPosition,
          capacity: Number(form.capacity),
          hasBoard: form.hasBoard,
        }
      : {
          name: form.name,
          location: form.location,
          minPosition: form.minPosition,
          modelName: form.modelName,
          serialNumber: form.serialNumber,
        };

  const uploadResourceImage = async (resourceId, image) => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);
    await api.post(`/admin/resources/${resourceId}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const validateImage = (file) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return "jpg, png, webp 이미지 파일만 등록할 수 있습니다.";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "이미지 파일 크기는 5MB를 넘을 수 없습니다.";
    }
    return "";
  };

  const handleFormChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = ({ file, setImage, preview, setPreview }) => {
    setResourceError("");

    if (!file) {
      setImage(null);
      setPreview("");
      return;
    }

    const validationMessage = validateImage(file);
    if (validationMessage) {
      setResourceError(validationMessage);
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetCreateForm = () => {
    setResourceForm(initialResourceForm);
    setResourceImage(null);
    setResourcePreview("");
    setResourceMessage("");
    setResourceError("");
  };

  const closeEditModal = () => {
    setEditingResource(null);
    setEditForm(initialResourceForm);
    setEditImage(null);
    setEditPreview("");
    setResourceError("");
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setResourceSaving(true);
    setResourceMessage("");
    setResourceError("");

    try {
      const created = await api.post(
        getResourceEndpoint(resourceForm),
        getResourcePayload(resourceForm),
      );
      await uploadResourceImage(created.data.data.id, resourceImage);
      setResourceMessage("자원이 등록되었습니다.");
      resetCreateForm();
      fetchResources();
    } catch (err) {
      setResourceError(err.response?.data?.message || "자원 등록에 실패했습니다.");
    } finally {
      setResourceSaving(false);
    }
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setEditForm({
      dtype: resource.dtype,
      name: resource.name ?? "",
      location: resource.location ?? "",
      minPosition: resource.minPosition ?? "ASSISTANT",
      capacity: resource.capacity ?? 1,
      hasBoard: Boolean(resource.hasBoard),
      modelName: resource.modelName ?? "",
      serialNumber: resource.serialNumber ?? "",
    });
    setEditImage(null);
    setEditPreview("");
    setResourceMessage("");
    setResourceError("");
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    if (!editingResource) return;

    setResourceSaving(true);
    setResourceMessage("");
    setResourceError("");

    try {
      await api.put(
        `${getResourceEndpoint(editForm)}/${editingResource.id}`,
        getResourcePayload(editForm),
      );
      await uploadResourceImage(editingResource.id, editImage);
      setResourceMessage("자원이 수정되었습니다.");
      closeEditModal();
      fetchResources();
    } catch (err) {
      setResourceError(err.response?.data?.message || "자원 수정에 실패했습니다.");
    } finally {
      setResourceSaving(false);
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!window.confirm(`${resource.name} 자원을 삭제하시겠습니까?`)) return;

    setResourceMessage("");
    setResourceError("");
    try {
      await api.delete(`/admin/resources/${resource.id}`);
      setResourceMessage("자원이 삭제되었습니다.");
      fetchResources();
    } catch (err) {
      setResourceError(err.response?.data?.message || "자원 삭제에 실패했습니다.");
    }
  };

  const formatTime = (t) => {
    if (!Array.isArray(t)) return "";
    const [y, m, d, h, min] = t;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  };

  const renderResourceFormFields = (form, setForm, disabledType = false) => (
    <>
      <div style={styles.formGrid}>
        <div style={styles.field}>
          <label style={styles.label}>자원 종류</label>
          <select
            name="dtype"
            value={form.dtype}
            onChange={handleFormChange(setForm)}
            style={styles.input}
            disabled={disabledType}
          >
            <option value="ROOM">회의실</option>
            <option value="EQUIPMENT">장비</option>
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>자원명</label>
          <input
            name="name"
            value={form.name}
            onChange={handleFormChange(setForm)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>위치</label>
          <input
            name="location"
            value={form.location}
            onChange={handleFormChange(setForm)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>최소 예약 직급</label>
          <select
            name="minPosition"
            value={form.minPosition}
            onChange={handleFormChange(setForm)}
            style={styles.input}
          >
            {minPositions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {form.dtype === "ROOM" ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>수용 인원</label>
              <input
                name="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleFormChange(setForm)}
                style={styles.input}
                required
              />
            </div>
            <label style={styles.checkField}>
              <input
                name="hasBoard"
                type="checkbox"
                checked={form.hasBoard}
                onChange={handleFormChange(setForm)}
              />
              화이트보드 있음
            </label>
          </>
        ) : (
          <>
            <div style={styles.field}>
              <label style={styles.label}>모델명</label>
              <input
                name="modelName"
                value={form.modelName}
                onChange={handleFormChange(setForm)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>시리얼 번호</label>
              <input
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleFormChange(setForm)}
                style={styles.input}
                required
              />
            </div>
          </>
        )}
      </div>
    </>
  );

  const renderResourceImagePicker = ({
    currentResource,
    imagePreview,
    setImage,
    setPreview,
    preview,
    helper,
  }) => (
    <div style={styles.imageUploadArea}>
      <div style={styles.imagePreview}>
        {imagePreview ? (
          <img src={imagePreview} alt="자원 이미지 미리보기" style={styles.image} />
        ) : currentResource?.imageUrl ? (
          <img
            src={getImageSrc(currentResource.imageUrl)}
            alt={currentResource.name}
            style={styles.image}
          />
        ) : (
          <span style={styles.noImage}>이미지를 선택하세요</span>
        )}
      </div>
      <div>
        <label style={styles.label}>자원 이미지</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) =>
            handleImageChange({
              file: e.target.files?.[0],
              setImage,
              preview,
              setPreview,
            })
          }
          style={styles.fileInput}
        />
        <p style={styles.helpText}>{helper}</p>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>관리자 페이지</h2>

      <div style={styles.tabBar}>
        {[
          { key: "users", label: "유저 관리" },
          { key: "reservations", label: "전체 예약" },
          { key: "resources", label: "자원 관리" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...styles.tabBtn,
              borderBottom:
                tab === t.key ? "2px solid #2563eb" : "2px solid transparent",
              color: tab === t.key ? "#2563eb" : "#6b7280",
              fontWeight: tab === t.key ? "bold" : "normal",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resources" && (
        <form style={styles.formPanel} onSubmit={handleCreateResource}>
          <div style={styles.formHeader}>
            <div>
              <h3 style={styles.formTitle}>자원 등록</h3>
              <p style={styles.formSub}>기본 정보와 이미지를 함께 등록할 수 있습니다.</p>
            </div>
            <button type="button" style={styles.secondaryBtn} onClick={resetCreateForm}>
              초기화
            </button>
          </div>

          {renderResourceFormFields(resourceForm, setResourceForm)}
          {renderResourceImagePicker({
            currentResource: null,
            imagePreview: resourcePreview,
            setImage: setResourceImage,
            setPreview: setResourcePreview,
            preview: resourcePreview,
            helper: "jpg, png, webp 파일을 5MB 이하로 등록할 수 있습니다.",
          })}

          {resourceError && !editingResource && <p style={styles.error}>{resourceError}</p>}
          {resourceMessage && <p style={styles.success}>{resourceMessage}</p>}

          <div style={styles.formActions}>
            <button type="submit" style={styles.primaryBtn} disabled={resourceSaving}>
              {resourceSaving && !editingResource ? "등록 중..." : "자원 등록"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={styles.empty}>불러오는 중...</p>
      ) : (
        <>
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
                    {minPositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {tab === "reservations" && (
            <div style={styles.bookingList}>
              {reservations.map((r) => (
                <article
                  key={r.id}
                  style={{
                    ...styles.bookingCard,
                    opacity: r.status === "CANCELED" ? 0.56 : 1,
                  }}
                >
                  <div style={styles.bookingInitial}>{r.resourceName?.slice(0, 1)}</div>
                  <div style={styles.bookingBody}>
                    <div style={styles.resourceTopLine}>
                      <span style={styles.resourceBadge}>예약</span>
                      <span style={styles.resourceLocation}>{r.resourceLocation}</span>
                    </div>
                    <h3 style={styles.resourceName}>{r.resourceName}</h3>
                    <p style={styles.bookingTime}>
                      {formatTime(r.startTime)} ~ {formatTime(r.endTime)?.slice(11)}
                    </p>
                    <p style={styles.sub}>예약자 {r.userName}</p>
                  </div>
                  <div style={styles.resourceActionPanel}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          r.status === "RESERVED" ? "#dcfce7" : "#f1f5f9",
                        color: r.status === "RESERVED" ? "#166534" : "#64748b",
                      }}
                    >
                      {r.status}
                    </span>
                    {r.status === "RESERVED" && (
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleForceCancel(r.id)}
                      >
                        강제 취소
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === "resources" && (
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
                          <span>{resource.capacity}명</span>
                          <span>
                            {resource.hasBoard ? "화이트보드 있음" : "화이트보드 없음"}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>{resource.modelName}</span>
                          <span>{resource.serialNumber}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={styles.resourceActionPanel}>
                    <p style={styles.actionHint}>관리</p>
                    <button
                      type="button"
                      style={styles.editBtn}
                      onClick={() => openEditModal(resource)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteResource(resource)}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {editingResource && (
        <div style={styles.overlay}>
          <form style={styles.editModal} onSubmit={handleUpdateResource}>
            <div style={styles.modalImageBand}>
              {editingResource.imageUrl ? (
                <img
                  src={getImageSrc(editingResource.imageUrl)}
                  alt={editingResource.name}
                  style={styles.image}
                />
              ) : (
                <span style={styles.noImage}>이미지 없음</span>
              )}
            </div>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div>
                  <p style={styles.modalEyebrow}>자원 정보 수정</p>
                  <h3 style={styles.modalTitle}>{editingResource.name}</h3>
                </div>
                <button type="button" style={styles.closeBtn} onClick={closeEditModal}>
                  ×
                </button>
              </div>

              {renderResourceFormFields(editForm, setEditForm, true)}
              {renderResourceImagePicker({
                currentResource: editingResource,
                imagePreview: editPreview,
                setImage: setEditImage,
                setPreview: setEditPreview,
                preview: editPreview,
                helper: "새 이미지를 선택하면 저장 시 기존 이미지를 교체합니다.",
              })}

              {resourceError && <p style={styles.error}>{resourceError}</p>}

              <div style={styles.modalActions}>
                <button type="button" style={styles.secondaryBtn} onClick={closeEditModal}>
                  취소
                </button>
                <button type="submit" style={styles.primaryBtn} disabled={resourceSaving}>
                  {resourceSaving ? "수정 중..." : "수정 완료"}
                </button>
              </div>
            </div>
          </form>
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
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "24px",
  },
  tabBar: {
    display: "flex",
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
  formPanel: {
    backgroundColor: "#fff",
    border: "1px solid #dbe3ef",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "24px",
    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
  },
  formHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
  },
  formTitle: {
    margin: 0,
    fontSize: "17px",
    color: "#111827",
  },
  formSub: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#6b7280",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "14px",
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
    padding: "9px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#fff",
    fontSize: "13px",
  },
  checkField: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    alignSelf: "end",
    minHeight: "38px",
    color: "#374151",
    fontSize: "13px",
  },
  imageUploadArea: {
    display: "grid",
    gridTemplateColumns: "180px 1fr",
    gap: "16px",
    alignItems: "center",
    marginTop: "16px",
  },
  imagePreview: {
    height: "110px",
    backgroundColor: "#f3f4f6",
    border: "1px dashed #d1d5db",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fileInput: {
    display: "block",
    marginTop: "8px",
    fontSize: "13px",
    color: "#374151",
  },
  helpText: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: "12px",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "16px",
  },
  primaryBtn: {
    padding: "9px 18px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "7px 12px",
    backgroundColor: "#fff",
    color: "#4b5563",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
  },
  success: {
    color: "#16a34a",
    fontSize: "13px",
    margin: "12px 0 0",
  },
  error: {
    color: "#ef4444",
    fontSize: "13px",
    margin: "12px 0 0",
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
    borderRadius: "8px",
    padding: "14px 20px",
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
  select: {
    fontSize: "13px",
    padding: "6px 10px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
  },
  bookingList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  bookingCard: {
    display: "grid",
    gridTemplateColumns: "96px 1fr 124px",
    gap: "18px",
    alignItems: "stretch",
    backgroundColor: "#fff",
    border: "1px solid #dbe3ef",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 2px 12px rgba(15, 23, 42, 0.05)",
  },
  bookingInitial: {
    minHeight: "96px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
  },
  bookingBody: {
    minWidth: 0,
    padding: "4px 0",
  },
  bookingTime: {
    margin: "0 0 4px",
    color: "#334155",
    fontSize: "13px",
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "5px 9px",
  },
  resourceList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  resourceCard: {
    display: "grid",
    gridTemplateColumns: "220px 1fr 124px",
    gap: "18px",
    alignItems: "stretch",
    backgroundColor: "#fff",
    border: "1px solid #dbe3ef",
    borderRadius: "8px",
    padding: "12px",
    boxShadow: "0 2px 12px rgba(15, 23, 42, 0.05)",
  },
  resourceImageBox: {
    minHeight: "142px",
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
    fontSize: "20px",
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
  resourceActionPanel: {
    borderLeft: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: "8px",
    paddingLeft: "12px",
  },
  actionHint: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    textAlign: "right",
  },
  editBtn: {
    padding: "9px 0",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  deleteBtn: {
    padding: "9px 0",
    backgroundColor: "#fff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
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
  editModal: {
    width: "min(860px, 100%)",
    maxHeight: "92vh",
    overflow: "auto",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
  },
  modalImageBand: {
    minHeight: "100%",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modalContent: {
    padding: "24px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px",
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
    fontSize: "22px",
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
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "18px",
  },
};
