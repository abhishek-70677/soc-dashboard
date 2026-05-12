import { useNavigate } from "react-router-dom";

function Login() {

  // Used for navigation between pages
  const navigate = useNavigate();

  // Function runs when login button is clicked
  const handleLogin = () => {

    // Move user to dashboard page
    navigate("/dashboard");
  };

  return (

    // Full screen container
    <div
      style={{
        height: "100vh",
        backgroundColor: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      {/* Login Card */}
      <div
        style={{
          width: "350px",
          backgroundColor: "#1e293b",
          padding: "40px",
          borderRadius: "10px",
          color: "white",
          boxShadow: "0px 0px 10px black",
        }}
      >

        {/* Heading */}
        <h1 style={{ textAlign: "center" }}>
          SOC Dashboard
        </h1>

        {/* Username Input */}
        <input
          type="text"
          placeholder="Enter Username"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "20px",
            borderRadius: "5px",
            border: "none",
          }}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Enter Password"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "15px",
            borderRadius: "5px",
            border: "none",
          }}
        />

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

      </div>
    </div>
  );
}

export default Login;