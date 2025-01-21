import { useState } from 'react'

const NewBlogForm = ({ addBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const newBlog = {
      title,
      author,
      url,
    }

    try {
      await addBlog(newBlog)
      setTitle('')
      setAuthor('')
      setUrl('')
    } catch (error) {
      console.error('Error creating blog:', error)
    }
  }

  return (
    <div>
      <h2>Create new blog</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <br />
        <label htmlFor="author">Author</label>
        <input
          type="text"
          id="author"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          required
        />
        <br />
        <label htmlFor="url">url</label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          required
        />
        <br />
        <button type="submit">Create Blog</button>
      </form>
    </div>
  )
}

export default NewBlogForm