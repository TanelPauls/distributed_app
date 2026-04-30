import { useState, useEffect } from "react";
import axios from 'axios';
import CommentsList from './CommentsList.jsx';
import CommentCreate from './CommentCreate.jsx';

const PostList = ({ refreshKey, onCreated, user }) => {
    const [posts, setPosts] = useState([]);

    useEffect(()=>{
        const fetchPosts = async ()  => {
            let token = localStorage.getItem('token');
            if (!token) {
                setPosts([]);
                return;
            }
            try {
                const res = await axios.get('/posts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosts(res.data);
            } catch(err) {
                if (err.response?.status !== 401) {
                    console.error(err);
                    setPosts([]);
                    return;
                }
                try {
                    const refreshRes = await fetch('https://hajusrakendus.neiwa.eu/auth/refresh', {
                        method: 'POST',
                        credentials: 'include',
                    });
                    if (!refreshRes.ok) { setPosts([]); return; }
                    const { accessToken } = await refreshRes.json();
                    localStorage.setItem('token', accessToken);
                    const retryRes = await axios.get('/posts', {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    setPosts(retryRes.data);
                } catch {
                    setPosts([]);
                }
            }
        };
        fetchPosts();
    }, [refreshKey]);

    const postsForRender = Array.isArray(posts)
        ? posts.map(post => (
            <div className="card" style={{ width: '30%', marginBottom: '20px'}} key={post.id}>
                <div className="card-body">
                <h3>{post.title}</h3>
                <CommentsList comments={post.comments}/>
                {user && <CommentCreate postId={post.id} onCreated={onCreated}/>}
                </div>
            </div>
            ))
        : null;

    return (
        <div className="d-flex flex-row flex-wrap justify-content-between">
            {postsForRender}
        </div>
    )
}

export default PostList;