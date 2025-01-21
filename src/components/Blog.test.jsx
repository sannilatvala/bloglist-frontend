import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

vi.mock('../services/blogs', () => ({
  default: {
    update: vi.fn(),
  },
}))

const updateBlogLikes = vi.fn()
const deleteBlog = vi.fn()

const mockBlog = {
  id: 1,
  title: 'Test Blog Title',
  author: 'Test Author',
  url: 'https://example.com',
  likes: 10,
  user: { username: 'testuser', name: 'Test User' },
}

const loggedInUser = 'testuser'

describe('Blog component', () => {
  test('renders blog title and author, but not url or likes initially', () => {
    render(
      <Blog
        blog={mockBlog}
        updateBlogLikes={updateBlogLikes}
        deleteBlog={deleteBlog}
        loggedInUser={loggedInUser}
      />
    )

    expect(screen.getByText('Test Blog Title Test Author')).toBeInTheDocument()

    expect(screen.queryByText('URL:')).not.toBeInTheDocument()
    expect(screen.queryByText('Likes:')).not.toBeInTheDocument()
  })

  test('renders URL and likes when expanded', async () => {
    render(
      <Blog
        blog={mockBlog}
        updateBlogLikes={updateBlogLikes}
        deleteBlog={deleteBlog}
        loggedInUser={loggedInUser}
      />
    )

    const user = userEvent.setup()

    await user.click(screen.getByText('View'))

    expect(screen.getByText('URL: https://example.com')).toBeInTheDocument()
    expect(screen.getByText('Likes: 10')).toBeInTheDocument()
    expect(screen.getByText('Added by: Test User')).toBeInTheDocument()
  })

  test('calls updateBlogLikes twice when like button is clicked twice', async () => {
    render(
      <Blog
        blog={mockBlog}
        updateBlogLikes={updateBlogLikes}
        deleteBlog={deleteBlog}
        loggedInUser={loggedInUser}
      />
    )

    const user = userEvent.setup()

    await user.click(screen.getByText('View'))

    const likeButton = screen.getByText('Like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(updateBlogLikes).toHaveBeenCalledTimes(2)
  })
})