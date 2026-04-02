const CommentsList = ({ comments }) => {
    const renderedComments = comments.map((comment) => {
        let content;

        if (comment.status === 'approved') {
            content = comment.content;
        } else if (comment.status === 'pending') {
            content = 'This comment awaiting moderation';
        } else {
            content = 'This comment was rejected';
        }

        return <li key={comment.id}>{content}</li>;
    });

    return <ul>{renderedComments}</ul>;
};

export default CommentsList;