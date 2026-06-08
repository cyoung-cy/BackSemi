import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    position: "ASSISTANT",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/signup", form);
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>이메일</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="이메일 입력"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>비밀번호</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="비밀번호 입력"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>이름</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="이름 입력"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>직급</label>
            <select
              style={styles.input}
              name="position"
              value={form.position}
              onChange={handleChange}
            >
              <option value="ASSISTANT">사원 (ASSISTANT)</option>
              <option value="MANAGER">매니저 (MANAGER)</option>
              <option value="EXECUTIVE">임원 (EXECUTIVE)</option>
            </select>
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit">
            가입하기
          </button>
        </form>
        <p style={styles.link}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "380px",
  },
  title: {
    textAlign: "center",
    marginBottom: "28px",
    fontSize: "22px",
    color: "#333",
  },
  field: {
    marginBottom: "16px",
  },
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
    outline: "none",
    boxSizing: "border-box",
  },
  error: {
    color: "#e74c3c",
    fontSize: "13px",
    marginBottom: "12px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    marginTop: "8px",
  },
  link: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "13px",
    color: "#777",
  },
};
