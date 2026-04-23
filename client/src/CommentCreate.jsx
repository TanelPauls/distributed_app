import axios from 'axios';
import { useState } from 'react';

const CommentCreate = ({postId, onCreated}) => {
    const [content, setContent] = useState('');

    const onChange =  (event) => {
        setContent(event.target.value)
    };

    const postComment = async (token) => {
        return axios.post(`/posts/${postId}/comments`, {content}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        let token = localStorage.getItem('token');
        try {
            await postComment(token);
        } catch (err) {
            if (err.response?.status !== 401) throw err;

            const refreshRes = await fetch('https://hajusrakendus.neiwa.eu/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });
            if (!refreshRes.ok) throw new Error('Session expired, please log in again');

            const { accessToken } = await refreshRes.json();
            localStorage.setItem('token', accessToken);
            await postComment(accessToken);
        }
        setContent('');
        onCreated();
    }

    return(
        <div>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label>New Comment</label>
                    <input 
                        value={content}
                        onChange={onChange}
                        className='form-control'
                    />
                </div>
                <button className='btn btn-primary'>Submit</button>
            </form>
        </div>
    )
}

export default CommentCreate