import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewBlogForm from './NewBlogForm'

describe('NewBlogForm', () => {
  it('calls addBlog with the correct data when the form is submitted', async () => {
    const mockAddBlog = vi.fn()

    render(<NewBlogForm addBlog={mockAddBlog} />)

    const titleInput = screen.getByLabelText(/title/i)
    const authorInput = screen.getByLabelText(/author/i)
    const urlInput = screen.getByLabelText(/url/i)
    const createButton = screen.getByText(/create blog/i)

    const user = userEvent.setup()

    await user.type(titleInput, 'Test Blog Title')
    await user.type(authorInput, 'Test Author')
    await user.type(urlInput, 'https://testblog.com')

    await user.click(createButton)

    expect(mockAddBlog).toHaveBeenCalledOnce()

    expect(mockAddBlog).toHaveBeenCalledWith({
      title: 'Test Blog Title',
      author: 'Test Author',
      url: 'https://testblog.com',
    })
  })
})