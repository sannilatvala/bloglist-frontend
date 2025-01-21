const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Test User',
        username: 'testuser',
        password: 'secret'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const usernameInput = page.locator('input[name="Username"]')
    const passwordInput = page.locator('input[name="Password"]')
    const loginButton = page.locator('button', { hasText: /login/i })

    await expect(usernameInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(loginButton).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      const usernameInput = page.locator('input[name="Username"]')
      const passwordInput = page.locator('input[name="Password"]')
      const loginButton = page.locator('button', { hasText: /login/i })

      await usernameInput.fill('testuser')
      await passwordInput.fill('secret')
      await loginButton.click()

      const blogsText = page.locator('h2', { hasText: 'Blogs' })
      const createNewBlogButton = page.locator('button', { hasText: 'Create new blog' })
      const logoutButton = page.locator('button', { hasText: 'logout' })

      await expect(blogsText).toBeVisible()
      await expect(createNewBlogButton).toBeVisible()
      await expect(logoutButton).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      const usernameInput = page.locator('input[name="Username"]')
      const passwordInput = page.locator('input[name="Password"]')
      const loginButton = page.locator('button', { hasText: /login/i })

      await usernameInput.fill('testuser')
      await passwordInput.fill('wrongpassword')
      await loginButton.click()

      const errorNotification = page.locator('.notification.error')
      const blogsText = page.locator('h2', { hasText: 'Blogs' })

      await expect(errorNotification).toHaveText('Wrong username or password')
      await expect(blogsText).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    test('a new blog can be created', async ({ page }) => {
      const usernameInput = page.locator('input[name="Username"]')
      const passwordInput = page.locator('input[name="Password"]')
      const loginButton = page.locator('button', { hasText: /login/i })

      await usernameInput.fill('testuser')
      await passwordInput.fill('secret')
      await loginButton.click()

      const createNewBlogButton = page.locator('button', { hasText: 'Create new blog' })
      await createNewBlogButton.click()

      const titleInput = page.locator('input#title')
      const authorInput = page.locator('input#author')
      const urlInput = page.locator('input#url')

      const submitButton = page.locator('button', { hasText: /create blog/i })

      const newBlogTitle = 'New Test Blog'
      const newBlogAuthor = 'Test Author'
      const newBlogUrl = 'http://newtestblog.com'

      await titleInput.fill(newBlogTitle)
      await authorInput.fill(newBlogAuthor)
      await urlInput.fill(newBlogUrl)
      await submitButton.click()

      const newBlog = page.locator('.blog', { hasText: `${newBlogTitle} ${newBlogAuthor}` })
      await expect(newBlog.first()).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      const usernameInput = page.locator('input[name="Username"]')
      const passwordInput = page.locator('input[name="Password"]')
      const loginButton = page.locator('button', { hasText: /login/i })

      await usernameInput.fill('testuser')
      await passwordInput.fill('secret')
      await loginButton.click()

      const createNewBlogButton = page.locator('button', { hasText: 'Create new blog' })
      await createNewBlogButton.click()

      const titleInput = page.locator('input#title')
      const authorInput = page.locator('input#author')
      const urlInput = page.locator('input#url')

      const submitButton = page.locator('button', { hasText: /create blog/i })

      const newBlogTitle = 'New Test Blog'
      const newBlogAuthor = 'Test Author'
      const newBlogUrl = 'http://newtestblog.com'

      await titleInput.fill(newBlogTitle)
      await authorInput.fill(newBlogAuthor)
      await urlInput.fill(newBlogUrl)
      await submitButton.click()

      const newBlog = page.locator('.blog', { hasText: `${newBlogTitle} ${newBlogAuthor}` })
      await newBlog.locator('button', { hasText: 'View' }).first().click()

      const likeButton = newBlog.locator('button', { hasText: 'Like' })
      const likesCount = newBlog.locator('.likes-count')

      const likesCountText = await likesCount.innerText()

      const initialLikes = parseInt(likesCountText.match(/\d+/)[0])

      await likeButton.click()
      await expect(likesCount).toHaveText(`Likes: ${initialLikes + 1}Like`)

      const updatedLikesText = await likesCount.innerText()
      const updatedLikes = parseInt(updatedLikesText.match(/\d+/)[0])

      await expect(updatedLikes).toBe(initialLikes + 1)
    })

    test('User who added the blog can delete it', async ({ page }) => {
      const usernameInput = page.locator('input[name="Username"]')
      const passwordInput = page.locator('input[name="Password"]')
      const loginButton = page.locator('button', { hasText: /login/i })

      await usernameInput.fill('testuser')
      await passwordInput.fill('secret')
      await loginButton.click()

      const createNewBlogButton = page.locator('button', { hasText: 'Create new blog' })
      await createNewBlogButton.click()

      const titleInput = page.locator('input#title')
      const authorInput = page.locator('input#author')
      const urlInput = page.locator('input#url')

      const submitButton = page.locator('button', { hasText: /create blog/i })

      const newBlogTitle = 'New Test Blog'
      const newBlogAuthor = 'Test Author'
      const newBlogUrl = 'http://newtestblog.com'

      await titleInput.fill(newBlogTitle)
      await authorInput.fill(newBlogAuthor)
      await urlInput.fill(newBlogUrl)
      await submitButton.click()

      const newBlog = page.locator('.blog', { hasText: `${newBlogTitle} ${newBlogAuthor}` }).first()
      await newBlog.locator('button', { hasText: 'View' }).first().click()

      await page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe(`Remove blog "${newBlogTitle}" by ${newBlogAuthor}?`)
        await dialog.accept()
      })

      const deleteButton = newBlog.locator('button', { hasText: 'Delete' })

      await deleteButton.click()
      await expect(newBlog).not.toBeVisible()

    })

    test('Only the user who added the blog can see the delete button', async ({ page, request }) => {
      await request.post('http://localhost:3003/api/users', {
        data: {
          name: 'Test User 2',
          username: 'testuser2',
          password: 'secret'
        }
      })

      const usernameInput = page.locator('input[name="Username"]')
      const passwordInput = page.locator('input[name="Password"]')
      const loginButton = page.locator('button', { hasText: /login/i })

      await usernameInput.fill('testuser')
      await passwordInput.fill('secret')
      await loginButton.click()

      const createNewBlogButton = page.locator('button', { hasText: 'Create new blog' })
      await createNewBlogButton.click()

      const titleInput = page.locator('input#title')
      const authorInput = page.locator('input#author')
      const urlInput = page.locator('input#url')

      const submitButton = page.locator('button', { hasText: /create blog/i })

      const newBlogTitle = 'New Test Blog'
      const newBlogAuthor = 'Test Author'
      const newBlogUrl = 'http://newtestblog.com'

      await titleInput.fill(newBlogTitle)
      await authorInput.fill(newBlogAuthor)
      await urlInput.fill(newBlogUrl)
      await submitButton.click()

      const newBlog = page.locator('.blog', { hasText: `${newBlogTitle} ${newBlogAuthor}` }).first()
      await newBlog.locator('button', { hasText: 'View' }).first().click()

      const deleteButton = newBlog.locator('button', { hasText: 'Delete' })
      await expect(deleteButton).toBeVisible()

      const logoutButton = page.locator('button', { hasText: /logout/i })
      await logoutButton.click()

      await usernameInput.fill('testuser2')
      await passwordInput.fill('secret')
      await loginButton.click()

      await newBlog.locator('button', { hasText: 'View' }).first().click()

      await expect(deleteButton).not.toBeVisible()
    })

    test('Blogs are ordered by the number of likes, most liked blog first', async ({ page }) => {
      const usernameInput = page.locator('input[name="Username"]')
      const passwordInput = page.locator('input[name="Password"]')
      const loginButton = page.locator('button', { hasText: /login/i })

      await usernameInput.fill('testuser')
      await passwordInput.fill('secret')
      await loginButton.click()

      const createNewBlogButton = page.locator('button', { hasText: 'Create new blog' })
      await createNewBlogButton.click()

      const titleInput = page.locator('input#title')
      const authorInput = page.locator('input#author')
      const urlInput = page.locator('input#url')

      const submitButton = page.locator('button', { hasText: /create blog/i })

      const blog1Title = 'Blog 1'
      const blog1Author = 'Author 1'
      const blog1Url = 'http://blog1.com'

      const blog2Title = 'Blog 2'
      const blog2Author = 'Author 2'
      const blog2Url = 'http://blog2.com'

      const blog3Title = 'Blog 3'
      const blog3Author = 'Author 3'
      const blog3Url = 'http://blog3.com'

      await titleInput.fill(blog1Title)
      await authorInput.fill(blog1Author)
      await urlInput.fill(blog1Url)
      await submitButton.click()

      await createNewBlogButton.click()
      await titleInput.fill(blog2Title)
      await authorInput.fill(blog2Author)
      await urlInput.fill(blog2Url)
      await submitButton.click()

      await createNewBlogButton.click()
      await titleInput.fill(blog3Title)
      await authorInput.fill(blog3Author)
      await urlInput.fill(blog3Url)
      await submitButton.click()

      const blog1 = page.locator('.blog', { hasText: `${blog1Title} ${blog1Author}` }).first()
      await blog1.locator('button', { hasText: 'View' }).first().click()

      const blog2 = page.locator('.blog', { hasText: `${blog2Title} ${blog2Author}` }).first()
      await blog2.locator('button', { hasText: 'View' }).first().click()

      const blog3 = page.locator('.blog', { hasText: `${blog3Title} ${blog3Author}` }).first()
      await blog3.locator('button', { hasText: 'View' }).first().click()

      const likeButtonForBlog1 = page.locator('.blog', { hasText: blog1Title }).locator('button', { hasText: 'Like' })
      const likeButtonForBlog2 = page.locator('.blog', { hasText: blog2Title }).locator('button', { hasText: 'Like' })
      const likeButtonForBlog3 = page.locator('.blog', { hasText: blog3Title }).locator('button', { hasText: 'Like' })

      await likeButtonForBlog1.click()
      await likeButtonForBlog1.click()
      await likeButtonForBlog1.click()

      await likeButtonForBlog2.click()
      await likeButtonForBlog2.click()
      await likeButtonForBlog2.click()
      await likeButtonForBlog2.click()
      await likeButtonForBlog2.click()

      await likeButtonForBlog3.click()

      const blogContents = await page.locator('.blog .title').allTextContents()

      const expectedOrder = [
        `${blog2Title} ${blog2Author}`,
        `${blog1Title} ${blog1Author}`,
        `${blog3Title} ${blog3Author}`
      ]

      expect(blogContents).toEqual(expectedOrder)
    })
  })
})