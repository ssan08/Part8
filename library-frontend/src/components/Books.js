import React, { useState } from 'react'
import { getTypenameFromResult } from '@apollo/client/utilities/graphql/storeUtils'


const BookL = (props) => {
  var index = 0
  for (let i = 0; i < props.genre_list.length; i++) {
    if (props.genre_list[i] === props.genre) {
      index = i
    }
  }
  return (
    <div>
      <h2>books</h2>
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
          {props.book[index].map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td></td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}


const Books = (props) => {
  const [genre, setGenre] = useState('')
  var genre_list = []
  var book = []
  if (!props.show) {
    return null
  }

  var books = null
  if (props.result.data) {

    function remDuplicates(a) {
      return a.filter((v, i) => a.indexOf(v) === i)
    }
    books = props.result.data.allBooks
    for (let index = 0; index < books.length; index++) {
      for (let i = 0; i < books[index].genres.length; i++) {
        if (genre_list) {
          genre_list = genre_list.concat(books[index].genres[i])
        }
        else {
          genre_list = books[index].genres[i]
        }

      }
    }
    genre_list = remDuplicates(genre_list)
    for (let index = 0; index < genre_list.length; index++) {
      var book_list = []
      var k = 0
      for (let i = 0; i < books.length; i++) {
        for (let j = 0; j < books[i].genres.length; j++) {
          if (books[i].genres[j] === genre_list[index]) {
            book_list[k] = {
              title: books[i].title,
              author: books[i].author.name,
              published: books[i].published,
              genre: genre_list[index]
            }
            k = k + 1
          }
        }
        book[index] = book_list
      }

    }
  }


  if (props.result.loading) {
    return <div>loading...</div>
  }


  return (
    <div>
      <BookL
        genre={genre} book={book} genre_list={genre_list}
      />
      <div>
        {genre_list.map((g, i) =>
          <button key={i} onClick={() => setGenre(g)}> {g}</button>
        )}
      </div>
    </div>


  )
}

export default Books