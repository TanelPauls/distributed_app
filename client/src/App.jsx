import { useState } from 'react';
import { Routes, Route, Link } from "react-router-dom";
import PostCreate from "./PostCeate";
import PostList from "./PostList";
import LoginPage from "./LoginPage";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <div className='container'>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="mb-0">Create Post</h1>
                <Link to="/login" className="btn btn-primary">
                  Login
                </Link>
              </div>

              <PostCreate onCreated={refresh} />
              <hr />
              <h1>Posts</h1>
              <PostList refreshKey={refreshKey} onCreated={refresh} />
            </>
          }
        />

        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;