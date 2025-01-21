import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import blogService from './services/blogs'
import NewBlogForm from './components/NewBlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: '', type: '' })

  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    if (user) {
      blogService.getAll().then((blogs) => {
        const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)
        setBlogs(sortedBlogs)
      })
    }
  }, [user])

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('loggedUser')
    showNotification('Logged out successfully', 'success')
  }

  const addBlog = async (newBlog) => {
    try {
      const createdBlog = await blogService.create(newBlog)
      setBlogs(blogs.concat(createdBlog))
      blogFormRef.current.toggleVisibility()
      showNotification(`A new blog "${createdBlog.title}" by "${createdBlog.author}" added`, 'success')
    } catch (error) {
      console.error('Error adding blog:', error)
      showNotification('Error creating blog', 'error')
    }
  }

  const deleteBlog = async (id) => {
    try {
      await blogService.remove(id)
      setBlogs(blogs.filter((blog) => blog.id !== id))
      showNotification('Blog deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting blog:', error)
      showNotification('Failed to delete blog', 'error')
    }
  }

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: '', type: '' }), 3000)
  }

  const updateBlogLikes = (updatedBlog) => {
    const updatedBlogs = blogs.map(blog =>
      blog.id === updatedBlog.id ? updatedBlog : blog
    )
    const sortedBlogs = updatedBlogs.sort((a, b) => b.likes - a.likes)
    setBlogs(sortedBlogs)
  }

  return (
    <div>
      <Notification message={notification.message} type={notification.type} />
      {user === null ? (
        <LoginForm setUser={setUser} showNotification={showNotification} />
      ) : (
        <div className="spacing-container">
          <h2>Blogs</h2>
          Welcome, {user.name}
          <button onClick={handleLogout}>logout</button>
          <Togglable buttonLabel="Create new blog" ref={blogFormRef}>
            <NewBlogForm addBlog={addBlog} />
          </Togglable>
          {blogs.map((blog) => (
            <Blog
              key={blog.id}
              blog={blog}
              updateBlogLikes={updateBlogLikes}
              deleteBlog={deleteBlog}
              loggedInUser={user.username} />
          ))}
        </div>
      )}
    </div>
  )
}

export default App
