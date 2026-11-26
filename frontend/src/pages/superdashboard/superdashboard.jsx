
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../../services/api";
import "./superdashboard.css";

const navigation = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "hospitals", icon: "✚", label: "Hospitals" },
  { id: "verification", icon: "✓", label: "Verification Requests" },
  { id: "applications", icon: "▤", label: "Applications" },
  { id: "users", icon: "♙", label: "Previous Users" },
];

const pageTitle = {
  overview: "Super Admin Overview",
  hospitals: "Hospital Management",
  verification: "Verification Requests",
  applications: "Hospital Applications",
  users: "Previous Users",
};

const getToken = () =>
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token");

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "{}"
    );
  } catch {
    return {};
  }
};

const getList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.hospitals)) return data.hospitals;
  return [];
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getManagerDetails = (hospital) => {
  const manager =
    hospital.manager_details ||
    hospital.manager ||
    {};

  if (typeof manager === "string") {
    return {
      name: manager,
      email: "",
      phone: "",
    };
  }

  return {
    name:
      manager.name ||
      manager.full_name ||
      manager.username ||
      hospital.manager_name ||
      "Not assigned",
    email:
      manager.email ||
      hospital.manager_email ||
      "",
    phone:
      manager.phone ||
      hospital.manager_phone ||
      "",
  };
};

const normalizeHospital = (hospital) => {
  const manager = getManagerDetails(hospital);

  let status = hospital.status || "PENDING";

  if (hospital.is_archived) {
    status = "ARCHIVED";
  }

  return {
    id: hospital.id,
    name: hospital.name || "Unnamed Hospital",
    location: hospital.city || hospital.location || "Not provided",
    manager: manager.name,
    email: manager.email,
    phone: manager.phone,
    status,
    joined: formatDate(hospital.created_at),
    documents: [],
    rejectionReason: hospital.rejection_reason || "",
    totalUsers: hospital.total_users || 0,
    isArchived: Boolean(hospital.is_archived),
  };
};

const displayStatus = (status) => {
  const labels = {
    APPROVED: "Verified",
    PENDING: "Pending",
    REJECTED: "Rejected",
    SUSPENDED: "Banned",
    ARCHIVED: "Archived",
  };

  return labels[status] || status;
};

export default function SuperDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("overview");
  const [hospitals, setHospitals] = useState([]);
  const [archivedHospitals, setArchivedHospitals] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [selectedHospital, setSelectedHospital] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [mobileMenu, setMobileMenu] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const currentUser = getStoredUser();

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const token = getToken();

    if (!token) {
      throw new Error("Session expired. Please login again.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const responseText = await response.text();

    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error("Backend returned an invalid response.");
    }

    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(
        data.detail ||
        data.error ||
        data.rejection_reason ||
        "Something went wrong."
      );
    }

    return data;
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsData, hospitalData, archivedData] = await Promise.all([
        apiRequest("/super-admin/dashboard/"),
        apiRequest("/super-admin/hospitals/"),
        apiRequest("/super-admin/hospitals/?archived=true"),
      ]);

      setDashboardStats(statsData);

      setHospitals(
        getList(hospitalData).map(normalizeHospital)
      );

      setArchivedHospitals(
        getList(archivedData).map(normalizeHospital)
      );
    } catch (err) {
      setError(err.message);

      if (err.message.includes("Session expired")) {
        notify(err.message);
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const logout = () => {
    [
      "access_token",
      "refresh_token",
      "user",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    navigate("/login", { replace: true });
  };

  const pendingHospitals = hospitals.filter(
    (hospital) => hospital.status === "PENDING"
  );

  const verifiedHospitals = hospitals.filter(
    (hospital) => hospital.status === "APPROVED"
  );

  const bannedHospitals = hospitals.filter(
    (hospital) => hospital.status === "SUSPENDED"
  );

  const applications = [
    ...hospitals,
    ...archivedHospitals.filter(
      (archived) =>
        !hospitals.some((hospital) => hospital.id === archived.id)
    ),
  ];

  const users = useMemo(() => {
    const allHospitals = [...hospitals, ...archivedHospitals];

    return allHospitals
      .filter((hospital) => hospital.manager !== "Not assigned")
      .map((hospital) => ({
        id: `${hospital.id}-${hospital.manager}`,
        name: hospital.manager,
        email: hospital.email || "Not provided",
        role: "Hospital Manager",
        hospital: hospital.name,
        status: hospital.isArchived ? "Archived" : "Active",
      }));
  }, [hospitals, archivedHospitals]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        hospital.name.toLowerCase().includes(searchValue) ||
        hospital.location.toLowerCase().includes(searchValue) ||
        hospital.manager.toLowerCase().includes(searchValue);

      const matchesFilter =
        filter === "All" || hospital.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [hospitals, search, filter]);

  const changePage = (page) => {
    setActivePage(page);
    setSelectedHospital(null);
    setMobileMenu(false);
    setSearch("");
    setFilter("All");
  };

  const updateHospitalStatus = async (id, status) => {
    let rejectionReason = "";

    if (status === "REJECTED") {
      rejectionReason = window.prompt(
        "Please enter the reason for rejecting this hospital:"
      );

      if (rejectionReason === null) return;

      if (!rejectionReason.trim()) {
        notify("Rejection reason is required.");
        return;
      }
    }

    setActionLoading(true);

    try {
      const body = {
        status,
        ...(status === "REJECTED"
          ? { rejection_reason: rejectionReason.trim() }
          : {}),
      };

      await apiRequest(
        `/super-admin/hospitals/${id}/status/`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        }
      );

      setSelectedHospital(null);
      setConfirmation(null);

      await loadDashboard();

      notify(`Hospital ${displayStatus(status).toLowerCase()} successfully.`);
    } catch (err) {
      notify(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const archiveHospital = async (id) => {
    setActionLoading(true);

    try {
      await apiRequest(
        `/super-admin/hospitals/${id}/archive/`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      setSelectedHospital(null);
      setConfirmation(null);

      await loadDashboard();

      notify("Hospital archived successfully.");
    } catch (err) {
      notify(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, description }) => (
    <div className="sd-stat-card">
      <div className="sd-stat-top">
        <span>{title}</span>
        <span className="sd-stat-icon">{icon}</span>
      </div>
      <h2>{value ?? 0}</h2>
      <p>{description}</p>
    </div>
  );

  const Status = ({ value }) => {
    const label = displayStatus(value);
    const cssClass = label.toLowerCase().replace(/\s+/g, "-");

    return (
      <span className={`sd-status sd-status-${cssClass}`}>
        {label}
      </span>
    );
  };

  const HospitalTable = () => (
    <div className="sd-table-wrapper">
      <table className="sd-table">
        <thead>
          <tr>
            <th>Hospital</th>
            <th>Manager</th>
            <th>Location</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredHospitals.map((hospital) => (
            <tr key={hospital.id}>
              <td>
                <strong>{hospital.name}</strong>
                <small>ID: #{hospital.id}</small>
              </td>

              <td>{hospital.manager}</td>
              <td>{hospital.location}</td>
              <td><Status value={hospital.status} /></td>

              <td>
                <button
                  className="sd-text-btn"
                  onClick={() => setSelectedHospital(hospital)}
                >
                  View Details →
                </button>
              </td>
            </tr>
          ))}

          {filteredHospitals.length === 0 && (
            <tr>
              <td colSpan="5" className="sd-empty">
                No hospitals found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const SearchBar = () => (
    <div className="sd-toolbar">
      <input
        type="search"
        placeholder="Search hospitals, managers or location..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <select
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      >
        <option value="All">All Hospitals</option>
        <option value="APPROVED">Verified</option>
        <option value="PENDING">Pending</option>
        <option value="REJECTED">Rejected</option>
        <option value="SUSPENDED">Banned</option>
      </select>
    </div>
  );

  const openConfirmation = (type, hospital) => {
    setConfirmation({
      type,
      id: hospital.id,
      name: hospital.name,
    });
  };

  if (loading) {
    return (
      <div className="sd-layout">
        <main className="sd-main">
          <div className="sd-content">
            <p>Loading Super Admin Dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="sd-layout">

      {mobileMenu && (
        <div
          className="sd-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sd-sidebar ${mobileMenu ? "sd-sidebar-open" : ""}`}>
        <div className="sd-brand">
          <div className="sd-brand-logo">H</div>
          <div>
            <h2>HandoverMind</h2>
            <span>ADMINISTRATION</span>
          </div>
        </div>

        <div className="sd-nav-label">MAIN MENU</div>

        <nav className="sd-navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`sd-nav-item ${
                activePage === item.id ? "sd-nav-active" : ""
              }`}
              onClick={() => changePage(item.id)}
            >
              <span className="sd-nav-icon">{item.icon}</span>
              {item.label}

              {item.id === "verification" &&
                pendingHospitals.length > 0 && (
                  <span className="sd-nav-count">
                    {pendingHospitals.length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-bottom">
          <div className="sd-admin-profile">
            <div className="sd-avatar">SA</div>
            <div>
              <strong>{currentUser.username || "Super Admin"}</strong>
              <span>System Administrator</span>
            </div>
          </div>

          <button className="sd-logout" onClick={logout}>
            ↪ &nbsp; Logout
          </button>
        </div>
      </aside>

      <main className="sd-main">
        <header className="sd-header">
          <button
            className="sd-menu-btn"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div>
            <h1>{pageTitle[activePage]}</h1>
            <p>Manage and monitor the HandoverMind platform</p>
          </div>

          <div className="sd-header-right">
            <span className="sd-admin-tag">✦ Super Admin</span>
            <div className="sd-avatar">SA</div>
          </div>
        </header>

        <div className="sd-content">

          {error && (
            <section className="sd-panel">
              <p>{error}</p>
              <button className="sd-primary-btn" onClick={loadDashboard}>
                Retry
              </button>
            </section>
          )}

          {activePage === "overview" && (
            <>
              <div className="sd-welcome">
                <div>
                  <h2>Welcome back, Super Admin!</h2>
                  <p>Here's what's happening across your platform.</p>
                </div>
                <span>Platform Control Center</span>
              </div>

              <div className="sd-stats-grid">
                <StatCard
                  title="Total Hospitals"
                  value={dashboardStats.total_hospitals}
                  icon="✚"
                  description="Registered hospitals"
                />

                <StatCard
                  title="Verified Hospitals"
                  value={dashboardStats.approved_hospitals}
                  icon="✓"
                  description="Approved and active"
                />

                <StatCard
                  title="Pending Requests"
                  value={dashboardStats.pending_hospitals}
                  icon="◷"
                  description="Awaiting verification"
                />

                <StatCard
                  title="Banned Hospitals"
                  value={dashboardStats.suspended_hospitals}
                  icon="⊘"
                  description="Restricted hospitals"
                />
              </div>

              <section className="sd-panel">
                <div className="sd-panel-heading">
                  <div>
                    <h3>Recent Hospital Registrations</h3>
                    <p>Recently registered hospitals and their status</p>
                  </div>

                  <button
                    className="sd-primary-btn"
                    onClick={() => changePage("hospitals")}
                  >
                    View All Hospitals →
                  </button>
                </div>

                <HospitalTable />
              </section>

              <section className="sd-panel">
                <div className="sd-panel-heading">
                  <div>
                    <h3>Pending Verification</h3>
                    <p>Applications waiting for your review</p>
                  </div>

                  <button
                    className="sd-text-btn"
                    onClick={() => changePage("verification")}
                  >
                    View Requests →
                  </button>
                </div>

                {pendingHospitals.length === 0 ? (
                  <p className="sd-empty">
                    No pending verification requests.
                  </p>
                ) : (
                  pendingHospitals.map((hospital) => (
                    <div className="sd-request-row" key={hospital.id}>
                      <div>
                        <strong>{hospital.name}</strong>
                        <p>
                          Manager: {hospital.manager} · {hospital.joined}
                        </p>
                      </div>

                      <Status value={hospital.status} />
                    </div>
                  ))
                )}
              </section>
            </>
          )}

          {activePage === "hospitals" && (
            <section className="sd-panel">
              {selectedHospital ? (
                <>
                  <button
                    className="sd-back-btn"
                    onClick={() => setSelectedHospital(null)}
                  >
                    ← Back to Hospitals
                  </button>

                  <div className="sd-detail-heading">
                    <div>
                      <h2>{selectedHospital.name}</h2>
                      <p>Hospital ID: #{selectedHospital.id}</p>
                    </div>

                    <Status value={selectedHospital.status} />
                  </div>

                  <div className="sd-detail-grid">
                    <div>
                      <span>Hospital Name</span>
                      <strong>{selectedHospital.name}</strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>{selectedHospital.location}</strong>
                    </div>

                    <div>
                      <span>Registration Date</span>
                      <strong>{selectedHospital.joined}</strong>
                    </div>

                    <div>
                      <span>Total Users</span>
                      <strong>{selectedHospital.totalUsers}</strong>
                    </div>
                  </div>

                  <h3 className="sd-subheading">Hospital Manager</h3>

                  <div className="sd-manager-row">
                    <div className="sd-avatar">HM</div>
                    <div>
                      <strong>{selectedHospital.manager}</strong>
                      <p>{selectedHospital.email || "Email not provided"}</p>
                    </div>
                    <Status value={selectedHospital.status} />
                  </div>

                  {selectedHospital.rejectionReason && (
                    <>
                      <h3 className="sd-subheading">Rejection Reason</h3>
                      <p>{selectedHospital.rejectionReason}</p>
                    </>
                  )}

                  <h3 className="sd-subheading">Submitted Documents</h3>

                  <div className="sd-document-row">
                    <span>Document records</span>
                    <span className="sd-document-note">
                      No document records available
                    </span>
                  </div>

                  <div className="sd-detail-actions">
                    {selectedHospital.status !== "SUSPENDED" &&
                      selectedHospital.status !== "ARCHIVED" ? (
                        <button
                          className="sd-danger-btn"
                          disabled={actionLoading}
                          onClick={() =>
                            openConfirmation("suspend", selectedHospital)
                          }
                        >
                          Suspend Hospital
                        </button>
                      ) : selectedHospital.status === "SUSPENDED" ? (
                        <button
                          className="sd-success-btn"
                          disabled={actionLoading}
                          onClick={() =>
                            updateHospitalStatus(
                              selectedHospital.id,
                              "APPROVED"
                            )
                          }
                        >
                          Reactivate Hospital
                        </button>
                      ) : null}

                    {selectedHospital.status !== "ARCHIVED" && (
                      <button
                        className="sd-danger-outline"
                        disabled={actionLoading}
                        onClick={() =>
                          openConfirmation("archive", selectedHospital)
                        }
                      >
                        Archive Hospital
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="sd-panel-heading">
                    <div>
                      <h3>All Hospitals</h3>
                      <p>View hospitals, managers and account status</p>
                    </div>

                    <span className="sd-total-label">
                      {hospitals.length} Hospitals
                    </span>
                  </div>

                  <SearchBar />
                  <HospitalTable />
                </>
              )}
            </section>
          )}

          {activePage === "verification" && (
            <section className="sd-panel">
              <div className="sd-panel-heading">
                <div>
                  <h3>Hospital Verification</h3>
                  <p>Review hospital registration details</p>
                </div>

                <span className="sd-total-label">
                  {pendingHospitals.length} Pending
                </span>
              </div>

              <div className="sd-request-list">
                {pendingHospitals.map((hospital) => (
                  <div className="sd-verification-card" key={hospital.id}>
                    <div className="sd-verification-top">
                      <div>
                        <h3>{hospital.name}</h3>
                        <p>Manager: {hospital.manager}</p>
                        <p>Submitted: {hospital.joined}</p>
                        <p>Location: {hospital.location}</p>
                      </div>

                      <Status value={hospital.status} />
                    </div>

                    <h4>Submitted Documents</h4>

                    <div className="sd-document-row">
                      <span>Document records</span>
                      <span className="sd-document-note">
                        No document records available
                      </span>
                    </div>

                    <div className="sd-action-row">
                      <button
                        className="sd-success-btn"
                        disabled={actionLoading}
                        onClick={() =>
                          updateHospitalStatus(hospital.id, "APPROVED")
                        }
                      >
                        ✓ Approve
                      </button>

                      <button
                        className="sd-danger-btn"
                        disabled={actionLoading}
                        onClick={() =>
                          updateHospitalStatus(hospital.id, "REJECTED")
                        }
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}

                {pendingHospitals.length === 0 && (
                  <p className="sd-empty">
                    No pending applications available.
                  </p>
                )}
              </div>
            </section>
          )}

          {activePage === "applications" && (
            <section className="sd-panel">
              <div className="sd-panel-heading">
                <div>
                  <h3>All Hospital Applications</h3>
                  <p>Track approved, rejected and pending applications</p>
                </div>
              </div>

              <div className="sd-table-wrapper">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Application</th>
                      <th>Hospital</th>
                      <th>Manager</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((hospital) => (
                      <tr key={hospital.id}>
                        <td>#{hospital.id}</td>
                        <td><strong>{hospital.name}</strong></td>
                        <td>{hospital.manager}</td>
                        <td>{hospital.joined}</td>
                        <td><Status value={hospital.status} /></td>
                      </tr>
                    ))}

                    {applications.length === 0 && (
                      <tr>
                        <td colSpan="5" className="sd-empty">
                          No applications available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activePage === "users" && (
            <section className="sd-panel">
              <div className="sd-panel-heading">
                <div>
                  <h3>Previous Users History</h3>
                  <p>Manager records associated with hospitals</p>
                </div>
              </div>

              <div className="sd-table-wrapper">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Hospital</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.hospital}</td>
                        <td><Status value={user.status} /></td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan="5" className="sd-empty">
                          No manager records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="sd-history-note">
                Archived hospital manager records are displayed here when
                available. Archiving a hospital does not permanently delete it.
              </p>
            </section>
          )}

        </div>
      </main>

      {confirmation && (
        <div className="sd-modal-backdrop">
          <div className="sd-modal">
            <div className="sd-modal-icon">!</div>

            <h3>
              {confirmation.type === "suspend"
                ? "Suspend this hospital?"
                : "Archive this hospital?"}
            </h3>

            <p>
              Are you sure you want to{" "}
              {confirmation.type}{" "}
              <strong>{confirmation.name}</strong>?

              {confirmation.type === "archive" &&
                " The hospital will be archived, not permanently deleted."}
            </p>

            <div className="sd-modal-actions">
              <button
                className="sd-secondary-btn"
                disabled={actionLoading}
                onClick={() => setConfirmation(null)}
              >
                Cancel
              </button>

              <button
                className="sd-danger-btn"
                disabled={actionLoading}
                onClick={() => {
                  if (confirmation.type === "suspend") {
                    updateHospitalStatus(
                      confirmation.id,
                      "SUSPENDED"
                    );
                  } else {
                    archiveHospital(confirmation.id);
                  }
                }}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="sd-toast">{toast}</div>}
    </div>
  );
}
