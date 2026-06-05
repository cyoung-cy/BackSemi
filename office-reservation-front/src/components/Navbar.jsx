import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userRole = localStorage.getItem("userRole");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.logo}>
          🏢 공유 오피스 예약
        </Link>
        <Link to="/" style={styles.navLink}>
          자원 목록
        </Link>
        <Link to="/my-reservations" style={styles.navLink}>
          내 예약
        </Link>
        {userRole === "ROLE_ADMIN" && (
          <Link to="/admin" style={styles.adminLink}>
            관리자
          </Link>
        )}
      </div>
      <div style={styles.right}>
        <span style={styles.userInfo}>
          {userName}
          {userRole === "ROLE_ADMIN" && (
            <span style={styles.adminBadge}>관리자</span>
          )}
        </span>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 32px",
    height: "60px",
    backgroundColor: "#4f46e5",
    color: "#fff",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  logo: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "16px",
  },
  navLink: {
    color: "#c7d2fe",
    textDecoration: "none",
    fontSize: "14px",
  },
  adminLink: {
    color: "#fde68a",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "bold",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  userInfo: {
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  adminBadge: {
    backgroundColor: "#f59e0b",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
  },
  logoutBtn: {
    padding: "6px 14px",
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid #fff",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
};
