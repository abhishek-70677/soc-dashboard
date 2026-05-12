function Dashboard() {

  return (

    // Main Container
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
      }}
    >

      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#1e293b",
          padding: "20px",
        }}
      >

        <h2>SOC Dashboard</h2>

        <hr />

        {/* Sidebar Menu */}
        <p>Dashboard</p>
        <p>Alerts</p>
        <p>Reports</p>
        <p>Settings</p>

      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
        }}
      >

        {/* Navbar */}
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <h2>Security Operations Center</h2>
        </div>

        {/* Alert Cards */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
          }}
        >

          {/* Card 1 */}
          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "20px",
              borderRadius: "10px",
              width: "200px",
            }}
          >
            <h3>Total Alerts</h3>
            <h1>120</h1>
          </div>

          {/* Card 2 */}
          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "20px",
              borderRadius: "10px",
              width: "200px",
            }}
          >
            <h3>Critical Attacks</h3>
            <h1>15</h1>
          </div>

          {/* Card 3 */}
          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "20px",
              borderRadius: "10px",
              width: "200px",
            }}
          >
            <h3>Active Users</h3>
            <h1>8</h1>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;