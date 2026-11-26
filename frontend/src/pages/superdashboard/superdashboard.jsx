
import React, { useMemo, useState } from "react";
import "./superdashboard.css";

const initialHospitals = [
  {
    id: 1,
    name: "City Care Hospital",
    location: "Mathura, Uttar Pradesh",
    manager: "Rahul Sharma",
    email: "rahul@citycare.com",
    phone: "+91 9876543210",
    status: "Verified",
    joined: "20 Nov 2026",
    documents: ["Hospital Registration", "License Certificate"],
  },
  {
    id: 2,
    name: "LifeLine Hospital",
    location: "Delhi, India",
    manager: "Amit Verma",
    email: "amit@lifeline.com",
    phone: "+91 9876543211",
    status: "Pending",
    joined: "22 Nov 2026",
    documents: ["Hospital Registration", "License Certificate"],
  },
  {
    id: 3,
    name: "Medicare Hospital",
    location: "Agra, Uttar Pradesh",
    manager: "Neha Gupta",
    email: "neha@medicare.com",
    phone: "+91 9876543212",
    status: "Banned",
    joined: "18 Nov 2026",
    documents: ["Hospital Registration"],
  },
];

const initialRequests = [
  {
    id: 101,
    hospital: "LifeLine Hospital",
    manager: "Amit Verma",
    date: "22 Nov 2026",
    status: "Pending",
    documents: ["Hospital Registration", "License Certificate"],
  },
  {
    id: 102,
    hospital: "Sunrise Hospital",
    manager: "Karan Singh",
    date: "23 Nov 2026",
    status: "Pending",
    documents: ["Hospital Registration", "License Certificate"],
  },
];

const initialUsers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@citycare.com",
    role: "Hospital Manager",
    hospital: "City Care Hospital",
    status: "Active",
  },
  {
    id: 2,
    name: "Amit Verma",
    email: "amit@lifeline.com",
    role: "Hospital Manager",
    hospital: "LifeLine Hospital",
    status: "Active",
  },
];

const navigation = [
  { id: "overview", icon: "▦", label: "Overview" },
  { id: "hospitals", icon: "✚", label: "Hospitals" },
  { id: "verification", icon: "✓", label: "Verification Requests" },
  { id: "applications", icon: "▤", label: "Applications" },
  { id: "users", icon: "♙", label: "Previous Users" },
];

export default function SuperDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [requests, setRequests] = useState(initialRequests);
  const [users] = useState(initialUsers);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [toast, setToast] = useState("");

  const pendingCount = requests.filter(
    (request) => request.status === "Pending"
  ).length;

  const verifiedCount = hospitals.filter(
    (hospital) => hospital.status === "Verified"
  ).length;

  const bannedCount = hospitals.filter(
    (hospital) => hospital.status === "Banned"
  ).length;

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital) => {
      const matchesSearch =
        hospital.name.toLowerCase().includes(search.toLowerCase()) ||
        hospital.location.toLowerCase().includes(search.toLowerCase()) ||
        hospital.manager.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || hospital.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [hospitals, search, filter]);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  };

  const changePage = (page) => {
    setActivePage(page);
    setSelectedHospital(null);
    setMobileMenu(false);
    setSearch("");
    setFilter("All");
  };

  const updateHospitalStatus = (id, status) => {
    setHospitals((current) =>
      current.map((hospital) =>
        hospital.id === id ? { ...hospital, status } : hospital
      )
    );

    setSelectedHospital((current) =>
      current?.id === id ? { ...current, status } : current
    );

    setConfirmation(null);
    notify(`Hospital ${status.toLowerCase()} successfully.`);
  };

  const deleteHospital = (id) => {
    const hospital = hospitals.find((item) => item.id === id);

    setHospitals((current) =>
      current.filter((item) => item.id !== id)
    );

    setSelectedHospital(null);
    setConfirmation(null);
    notify(`${hospital?.name} deleted from this dashboard.`);
  };

  const updateRequest = (id, status) => {
    const request = requests.find((item) => item.id === id);

    setRequests((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );

    if (status === "Approved" && request) {
      setHospitals((current) => {
        const exists = current.some(
          (hospital) => hospital.name === request.hospital
        );

        if (exists) {
          return current.map((hospital) =>
            hospital.name === request.hospital
              ? { ...hospital, status: "Verified" }
              : hospital
          );
        }

        return [
          ...current,
          {
            id: Date.now(),
            name: request.hospital,
            location: "Location not provided",
            manager: request.manager,
            email: "Not provided",
            phone: "Not provided",
            status: "Verified",
            joined: request.date,
            documents: request.documents,
          },
        ];
      });
    }

    notify(`Request ${status.toLowerCase()} successfully.`);
  };

  const pageTitle = {
    overview: "Super Admin Overview",
    hospitals: "Hospital Management",
    verification: "Verification Requests",
    applications: "Hospital Applications",
    users: "Previous Users",
  };

  const StatCard = ({ title, value, icon, description }) => (
    <div className="sd-stat-card">
      <div className="sd-stat-top">
        <span>{title}</span>
        <span className="sd-stat-icon">{icon}</span>
      </div>
      <h2>{value}</h2>
      <p>{description}</p>
    </div>
  );

  const Status = ({ value }) => (
    <span className={`sd-status sd-status-${value.toLowerCase()}`}>
      {value}
    </span>
  );

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
        <option value="Verified">Verified</option>
        <option value="Pending">Pending</option>
        <option value="Banned">Banned</option>
      </select>
    </div>
  );

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
              {item.id === "verification" && pendingCount > 0 && (
                <span className="sd-nav-count">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-bottom">
          <div className="sd-admin-profile">
            <div className="sd-avatar">SA</div>
            <div>
              <strong>Super Admin</strong>
              <span>System Administrator</span>
            </div>
          </div>
          <button
            className="sd-logout"
            onClick={() => notify("Connect logout to your authentication system.")}
          >
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
                  value={hospitals.length}
                  icon="✚"
                  description="Registered hospitals"
                />
                <StatCard
                  title="Verified Hospitals"
                  value={verifiedCount}
                  icon="✓"
                  description="Approved and active"
                />
                <StatCard
                  title="Pending Requests"
                  value={pendingCount}
                  icon="◷"
                  description="Awaiting verification"
                />
                <StatCard
                  title="Banned Hospitals"
                  value={bannedCount}
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

                {requests.filter((r) => r.status === "Pending").length === 0 ? (
                  <p className="sd-empty">No pending verification requests.</p>
                ) : (
                  requests.filter((r) => r.status === "Pending").map((request) => (
                    <div className="sd-request-row" key={request.id}>
                      <div>
                        <strong>{request.hospital}</strong>
                        <p>Manager: {request.manager} · {request.date}</p>
                      </div>
                      <Status value={request.status} />
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
                    <div className="sd-detail-card">
                      <span>Hospital Location</span>
                      <strong>{selectedHospital.location}</strong>
                    </div>
                    <div className="sd-detail-card">
                      <span>Registration Date</span>
                      <strong>{selectedHospital.joined}</strong>
                    </div>
                    <div className="sd-detail-card">
                      <span>Manager Name</span>
                      <strong>{selectedHospital.manager}</strong>
                    </div>
                    <div className="sd-detail-card">
                      <span>Manager Email</span>
                      <strong>{selectedHospital.email}</strong>
                    </div>
                    <div className="sd-detail-card">
                      <span>Contact Number</span>
                      <strong>{selectedHospital.phone}</strong>
                    </div>
                  </div>

                  <h3 className="sd-subheading">Associated Managers</h3>
                  <div className="sd-manager-card">
                    <div className="sd-avatar">M</div>
                    <div>
                      <strong>{selectedHospital.manager}</strong>
                      <p>{selectedHospital.email}</p>
                    </div>
                    <Status value="Active" />
                  </div>

                  <h3 className="sd-subheading">Submitted Documents</h3>
                  {selectedHospital.documents.map((document, index) => (
                    <div className="sd-document-row" key={index}>
                      <span>▤ &nbsp; {document}</span>
                      <span className="sd-document-note">
                        Document record
                      </span>
                    </div>
                  ))}

                  <div className="sd-detail-actions">
                    {selectedHospital.status !== "Banned" ? (
                      <button
                        className="sd-danger-btn"
                        onClick={() => setConfirmation({
                          type: "ban",
                          id: selectedHospital.id,
                          name: selectedHospital.name,
                        })}
                      >
                        Ban Hospital
                      </button>
                    ) : (
                      <button
                        className="sd-success-btn"
                        onClick={() => updateHospitalStatus(
                          selectedHospital.id,
                          "Verified"
                        )}
                      >
                        Unban Hospital
                      </button>
                    )}

                    <button
                      className="sd-danger-outline"
                      onClick={() => setConfirmation({
                        type: "delete",
                        id: selectedHospital.id,
                        name: selectedHospital.name,
                      })}
                    >
                      Delete Hospital
                    </button>
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
                  <p>Review registration details and submitted documents</p>
                </div>
                <span className="sd-total-label">
                  {pendingCount} Pending
                </span>
              </div>

              <div className="sd-request-list">
                {requests.map((request) => (
                  <div className="sd-verification-card" key={request.id}>
                    <div className="sd-verification-top">
                      <div>
                        <h3>{request.hospital}</h3>
                        <p>Manager: {request.manager}</p>
                        <p>Submitted: {request.date}</p>
                      </div>
                      <Status value={request.status} />
                    </div>

                    <h4>Submitted Documents</h4>
                    {request.documents.map((doc, index) => (
                      <div className="sd-document-row" key={index}>
                        <span>▤ &nbsp; {doc}</span>
                        <span className="sd-document-note">Document record</span>
                      </div>
                    ))}

                    {request.status === "Pending" && (
                      <div className="sd-action-row">
                        <button
                          className="sd-success-btn"
                          onClick={() => updateRequest(request.id, "Approved")}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="sd-danger-btn"
                          onClick={() => updateRequest(request.id, "Rejected")}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="sd-empty">No applications available.</p>
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
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>#{request.id}</td>
                        <td><strong>{request.hospital}</strong></td>
                        <td>{request.manager}</td>
                        <td>{request.date}</td>
                        <td><Status value={request.status} /></td>
                      </tr>
                    ))}
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
                  <p>Preserved user records and associated hospitals</p>
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
                  </tbody>
                </table>
              </div>
              <p className="sd-history-note">
                Historical records are displayed separately from active
                hospital management. They should not be deleted when a
                hospital is removed.
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
              {confirmation.type === "ban"
                ? "Ban this hospital?"
                : "Delete this hospital?"}
            </h3>
            <p>
              Are you sure you want to {confirmation.type}{" "}
              <strong>{confirmation.name}</strong>?
              {confirmation.type === "delete" &&
                " This action removes it from this dashboard."}
            </p>
            <div className="sd-modal-actions">
              <button
                className="sd-secondary-btn"
                onClick={() => setConfirmation(null)}
              >
                Cancel
              </button>
              <button
                className="sd-danger-btn"
                onClick={() => {
                  if (confirmation.type === "ban") {
                    updateHospitalStatus(confirmation.id, "Banned");
                  } else {
                    deleteHospital(confirmation.id);
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="sd-toast">{toast}</div>}
    </div>
  );
}
