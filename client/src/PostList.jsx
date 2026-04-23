import { useState, useEffect } from "react";
import axios from 'axios';
import CommentsList from './CommentsList.jsx';
import CommentCreate from './CommentCreate.jsx';

const PostList = ({ refreshKey, onCreated }) => {
    const [posts, setPosts] = useState([]);

    useEffect(()=>{
        const fetchPosts = async ()  => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/posts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const posts = res.data;
                setPosts(posts);
            } catch(err) {
                console.error(err);
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
                <CommentCreate postId={post.id} onCreated={onCreated}/>
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