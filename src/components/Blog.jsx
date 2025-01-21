import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, updateBlogLikes, deleteBlog, loggedInUser }) => {
  const [expanded, setExpanded] = useState(false)

  const handleLike = async () => {
    const updatedBlog = { ...blog, likes: blog.likes + 1 }

    try {
      await blogService.update(blog.id, updatedBlog)

      updateBlogLikes(updatedBlog)
    } catch (error) {
      console.error('Error liking blog:', error)
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)) {
      deleteBlog(blog.id)
    }
  }

  return (
    <div className={`blog ${expanded ? 'expanded' : ''}`}>
      {expanded ? (
        <div>
          <p className="title">
            {blog.title} {blog.author}
          </p>
          <div className="details">
            <p>URL: {blog.url}</p>
            <p className="likes-count">Likes: {blog.likes}
              <button onClick={handleLike}>Like</button>
            </p>
            <p>Added by: {blog.user?.name || 'Unknown'}</p>
            {loggedInUser === blog.user?.username && (
              <button onClick={handleDelete} className="delete">Delete</button>
            )}
          </div>
          <button onClick={() => setExpanded(false)}>Hide</button>
        </div>
      ) : (
        <div>
          {blog.title} {blog.author}
          <button onClick={() => setExpanded(true)}>View</button>
        </div>
      )}
    </div>
  )
}

export default Blog