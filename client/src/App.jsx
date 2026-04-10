// import './App.css';

import { useState } from 'react';
import PostCreate from "./PostCeate";
import PostList from "./PostList";


function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <>
      <div className='container'>
        <h1>Create Post</h1>
        <PostCreate onCreated={refresh} />
        <hr />
        <h1>Posts</h1>
        <PostList refreshKey={refreshKey} onCreated={refresh} />
      </div>

    </>
  )
}

export default App
