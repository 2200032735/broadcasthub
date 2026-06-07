
import "../styles/global.css";

export default function Login() {
  return (
    <div className="main">
      <div className="card">

        <div className="logoBox">
          <div className="logo">📡</div>

          <div>
            <h1>BroadcastHub</h1>
            <p>Controlled messaging</p>
          </div>
        </div>

        <div className="tabs">
          <button className="active">Sign In</button>
          <button>Register</button>
        </div>

        <div className="inputGroup">
          <label>EMAIL</label>
          <input type="email" placeholder="you@example.com" />
        </div>

        <div className="inputGroup">
          <label>PASSWORD</label>
          <input type="password" placeholder="••••••••" />
        </div>

        <button className="loginBtn">
          🔐 Sign In
        </button>

        <div className="footerText">
          Admin? Sign in with your admin email.
        </div>

      </div>
    </div>
  );
}
