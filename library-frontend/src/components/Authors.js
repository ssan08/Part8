
import React, { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { set } from 'mongoose'


const UPDATE_AUTHOR = gql`
mutation updateAuthor($name: String!, $year: Int!) {
  editAuthor(
    name: $name,
    setBornTo: $year
) {
  name
  born
  }
}
`


const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const [updateAuthor] = useMutation(UPDATE_AUTHOR)

  if (!props.show) {
    return null
  }
  var authors = null
  if (props.result.data) {
    authors = props.result.data.allAuthors
    if (name == '') {
      setName(authors[0].name)
    }


  }

  if (props.result.loading) {
    return <div>loading...</div>
  }

  const submit = async (event) => {
    event.preventDefault()
    const year = Number(born)
    updateAuthor({ variables: { name, year } })
    setName(authors[0].name)
    setBorn('')
    setTimeout(function () {
      document.location.reload()
    }, 2000)
  }
  if (props.token) {
    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>
                born
            </th>
              <th>
                books
            </th>
            </tr>
            {authors.map(a =>
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            )}
          </tbody>
        </table>
        <h3>Set birthyear</h3>
        <label>
          Select Author:
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map(a =>
              <option key={a.name}
                value={a.name}>
                {a.name}
              </option>
            )}
          </select>
        </label>
        <form onSubmit={submit}>
          <div>
            born
          <input
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type='submit'>update Author</button>
        </form>

      </div>
    )

  }
  else {
    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>
                born
            </th>
              <th>
                books
            </th>
            </tr>
            {authors.map(a =>
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }


}

export default Authors
