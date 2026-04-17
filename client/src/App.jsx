import { useState, useEffect } from 'react';
import { Routes, Route, Link } from "react-router-dom";
import PostCreate from "./PostCeate";
import PostList from "./PostList";
import LoginPage from "./LoginPage";

function App() {
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("https://hajusrakendus.neiwa.eu/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setUser(data.user);

      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className='container'>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="mb-0">Create Post</h1>

                {user ? (
                  <>
                    <span className="me-2">Hello, {user.email}</span>
                    <button onClick={logout} className="btn btn-secondary">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    Login
                  </Link>
                )}
              </div>

              <PostCreate onCreated={refresh} />

              <hr />
              <h1>Posts</h1>
              <PostList refreshKey={refreshKey} onCreated={refresh} />
            </>
          }
        />

        <Route path="/login" element={<LoginPage setUser={setUser} />} />
      </Routes>
    </div>
  );
}

export default App;