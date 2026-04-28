import { useNavigate, useLocation } from "react-router-dom";
import { Calendar1Icon, GlobeIcon } from "lucide-react";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArticleIcon from "@mui/icons-material/Article";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import { removeToken, isAdmin } from '../lib/auth';

const NAV_ITEMS = [
  { icon: BarChartIcon,   label: "Overview",         path: "/",  mui: true },
  { icon: Calendar1Icon,  label: "Calendar",          path: "/calendar",          mui: false },
  { icon: GlobeIcon,      label: "WordPress Sites",   path: "/wp-sites",  mui: false },
  { icon: ArticleIcon,    label: "WordPress Posts",   path: "/wp-posts",  mui: true },
  { icon: PeopleIcon,     label: "Clients",           path: "/clients",   mui: true },
];

export default function Sidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    removeToken();
    navigate('/login');
  };

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap');

        .sb-wrap {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #0c0c0f;
          font-family: 'Geist', sans-serif;
          border-right: 1px solid rgba(255,255,255,0.06);
          position: relative;
          overflow: hidden;
        }

        .sb-wrap::before {
          content: '';
          position: absolute;
          top: -80px;
          left: -80px;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: ${collapsed ? '20px 0' : '20px 18px'};
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 8px;
        }

        .sb-logo-mark {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #f97316, #ea580c);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(249,115,22,0.3);
        }

        .sb-logo-text {
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          letter-spacing: -0.3px;
          white-space: nowrap;
          overflow: hidden;
        }

        .sb-section-label {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.2);
          letter-spacing: 1.2px;
          text-transform: uppercase;
          padding: ${collapsed ? '10px 0 6px' : '10px 18px 6px'};
          text-align: ${collapsed ? 'center' : 'left'};
        }

        .sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: ${collapsed ? '10px 0' : '10px 14px'};
          margin: ${collapsed ? '2px 8px' : '2px 10px'};
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          text-decoration: none;
          border: 1px solid transparent;
        }

        .sb-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.07);
        }

        .sb-item.active {
          background: rgba(249,115,22,0.12);
          border-color: rgba(249,115,22,0.2);
        }

        .sb-item.active .sb-icon {
          color: #f97316 !important;
        }

        .sb-item.active .sb-label {
          color: #fff !important;
          font-weight: 500;
        }

        .sb-item.active::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #f97316;
          border-radius: 0 3px 3px 0;
        }

        .sb-icon {
          color: rgba(255,255,255,0.35);
          transition: color 0.15s;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          font-size: 18px !important;
          width: 18px;
          height: 18px;
        }

        .sb-label {
          font-size: 13.5px;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
          overflow: hidden;
          transition: color 0.15s;
          letter-spacing: -0.1px;
        }

        .sb-item:hover .sb-icon {
          color: rgba(255,255,255,0.7);
        }

        .sb-item:hover .sb-label {
          color: rgba(255,255,255,0.8);
        }

        .sb-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 8px 14px;
        }

        .sb-logout {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: ${collapsed ? '10px 0' : '10px 14px'};
          margin: ${collapsed ? '2px 8px' : '2px 10px'};
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          border: 1px solid transparent;
        }

        .sb-logout:hover {
          background: rgba(248,113,113,0.08);
          border-color: rgba(248,113,113,0.15);
        }

        .sb-logout:hover .sb-logout-icon {
          color: #f87171;
        }

        .sb-logout:hover .sb-logout-label {
          color: #f87171;
        }

        .sb-logout-icon {
          color: rgba(248,113,113,0.45);
          transition: color 0.15s;
          display: flex;
          align-items: center;
          font-size: 18px !important;
          width: 18px;
          height: 18px;
        }

        .sb-logout-label {
          font-size: 13.5px;
          color: rgba(248,113,113,0.5);
          transition: color 0.15s;
          white-space: nowrap;
          overflow: hidden;
        }

        .sb-bottom {
          margin-top: auto;
          padding-bottom: 12px;
        }

        .sb-nav {
          flex: 1;
          padding-top: 4px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sb-nav::-webkit-scrollbar { width: 0; }
      `}</style>

      <div className="sb-wrap">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8 L8 4 L12 8 L8 12 Z" fill="white" opacity="0.9" />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </div>
          {!collapsed && <span className="sb-logo-text">Halla Bol</span>}
        </div>

        {/* Nav */}
        <div className="sb-nav">
          {!collapsed && <p className="sb-section-label">Main</p>}

          {NAV_ITEMS.map(({ icon: Icon, label, path, mui }) => (
            <div
              key={path}
              className={`sb-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => navigate(path)}
              title={collapsed ? label : undefined}
            >
              <span className="sb-icon">
                {mui
                  ? <Icon style={{ fontSize: 18 }} />
                  : <Icon size={18} />
                }
              </span>
              {!collapsed && <span className="sb-label">{label}</span>}
            </div>
          ))}

          {isAdmin() && (
            <>
              {!collapsed && <p className="sb-section-label" style={{ marginTop: 12 }}>Admin</p>}
              {collapsed && <div className="sb-divider" style={{ marginTop: 8 }} />}
              <div
                className={`sb-item ${isActive('/invite') ? 'active' : ''}`}
                onClick={() => navigate('/invite')}
                title={collapsed ? 'User Management' : undefined}
              >
                <span className="sb-icon"><PersonAddIcon style={{ fontSize: 18 }} /></span>
                {!collapsed && <span className="sb-label">User Management</span>}
              </div>
            </>
          )}
        </div>

        {/* Bottom */}
        <div className="sb-bottom">
          <div className="sb-divider" />
          <div className="sb-logout" onClick={logout} title={collapsed ? 'Logout' : undefined}>
            <span className="sb-logout-icon"><LogoutIcon style={{ fontSize: 18 }} /></span>
            {!collapsed && <span className="sb-logout-label">Logout</span>}
          </div>
        </div>
      </div>
    </>
  );
}