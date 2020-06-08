
import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery, useSubscription, useMutation } from '@apollo/client'

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    author{
      name
    }
    published
    genres
  }
  `
const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BOOK_DETAILS}
`


const ALL_AUTHORS = gql`
query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
query {
    allBooks {
      title
      author{
        name
      }
      published
      genres
    }
  }
`
const LOGIN = gql`
mutation login($username: String!, $password: String!) {
  login(
    username: $username,
    password: $password,
  ) {
      value
  }
}
`
const ME = gql`
query {
  me{
    username
    favoriteGenre
  }
}
`

const Reco = (props) => {
  if (!props.show) {
    return null
  }
  var book = []
  var k = 0
  if (props.books.data && props.user.data) {
    const books = props.books.data.allBooks
    const me = props.user.data.me
    for (let index = 0; index < books.length; index++) {
      for (let i = 0; i < books[index].genres.length; i++) {
        if (me.favoriteGenre === books[index].genres[i]) {
          book[k] = books[index]
          k = k + 1
        }
      }

    }

  }

  if (book) {
    return (
      <div>
        <h3>books in your favorite genre "{props.user.data.me.favoriteGenre}"</h3>
        <table>
          <tbody>
            <tr>
              <th>
              </th>
              <th>
              </th>
              <th>
                author
        </th>
              <th>
                published
        </th>
            </tr>
            {book.map(a =>
              <tr key={a.title}>
                <td>{a.title}</td>
                <td></td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
  else {
    return (
      <p> </p>
    )
  }
}

const App = () => {
  const authors = useQuery(ALL_AUTHORS)
  const [page, setPage] = useState('authors')
  const books = useQuery(ALL_BOOKS)
  const me = useQuery(ME)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message)
    }
  })

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      window.alert(`A new book ${subscriptionData.data.bookAdded.title} by 
       ${subscriptionData.data.bookAdded.author.name} added in  ${subscriptionData.data.bookAdded.genres[0]}`)
       setTimeout(function () {
        document.location.reload()
        }, 2000)
    }
  })

  useEffect(() => {
    if (localStorage.getItem('user-token')) {
      setToken(localStorage.getItem('user-token'))
    }
  })



  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('user-token', token)
    }
  }, [result.data])


  const Login = (props) => {
    const [username, setUserName] = useState('')
    const [password, setPassword] = useState('')

    if (!props.show) {
      return null
    }




    const submit = async (event) => {
      event.preventDefault()
      login({ variables: { username, password } })
      setUserName('')
      setPassword('')
      setTimeout(function () {
        document.location.reload()
      }, 2000)
    }
    if (!token) {

      return (


        <div>
          <form onSubmit={submit}>
            <div>
              username
          <input
                value={username}
                onChange={({ target }) => setUserName(target.value)}
              />
            </div>
            <div>
              password
          <input type="password"
                value={password}
                onChange={({ target }) => setPassword(target.value)}
              />
            </div>
            <button type='submit'>Login</button>
          </form>
        </div>
      )
    }
    else {
      setPage('books')
      return (
        <p></p>
      )
    }



  }

  function logout() {
    setToken('')
    localStorage.clear()
    setPage('books')
  }

  if (token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('add')}>add book</button>
          <button onClick={() => setPage('reco')}>recommendations</button>
          <button onClick={() => logout()}>logout</button>

        </div>

        <Authors
          show={page === 'authors'} result={authors} token={token}
        />

        <Books
          show={page === 'books'} result={books}
        />

        <NewBook
          show={page === 'add'}
        />

        <Reco
          show={page === 'reco'} books={books} user={me}
        />

      </div>
    )

  }

  else {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>

        </div>

        <Authors
          show={page === 'authors'} result={authors} token={token}
        />

        <Books
          show={page === 'books'} result={books}
        />

        <Login
          show={page === 'login'} result={books}
        />

      </div>
    )

  }

}

export default App