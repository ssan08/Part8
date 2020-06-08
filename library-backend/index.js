const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const MONGODB_URI = 'mongodb+srv://sangita:FullStack2%23@cluster0-88zj5.mongodb.net/graphql?retryWrites=true'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })


const typeDefs = gql`
type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }


  type User {
    username: String!
    favoriteGenre: String!
    friends: [Book!]!
    id: ID!
  }
  
  type Token {
    value: String!
  }
  

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
        title: String!
        published: Int!
        author: String!
        genres: [String!]!
    ): Book

    editAuthor(
        name: String!
        setBornTo: Int!
    ): Author

    createUser(
        username: String!
        favoriteGenre: String!
      ): User

    login(
        username: String!
        password: String!
      ): Token
  }

  type Subscription {
    bookAdded: Book!
  } 


`

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            var allbooks = []
            var r = []
            const books = await Book.find({})
            const authors = await Author.find({})
            for (let index = 0; index < books.length; index++) {
                for (let i = 0; i < authors.length; i++) {
                    if (books[index].author.equals(authors[i]._id)) {
                        books[index].author = authors[i]

                    }

                }

            }
            return books


        },
        allAuthors: () => Author.find({}),
        me: (root, args, context) => {
            return context.currentUser
        }
    },
    Author: {
        name: (root) => root.name,
        born: (root) => root.born,
        id: (root) => root.id,
        bookCount: async (root) => {
            const book = await Book.find({})
            var count = 0
            for (let index = 0; index < book.length; index++) {
                if (book[index].author.equals(root._id)) {
                    count = count + 1
                }

            }
            return count
        }
    },

    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = context.currentUser
            if (!currentUser) {
                throw new AuthenticationError("not authenticated")
            }
            const auth = await Author.find({})
            var i = -1
            for (let index = 0; index < auth.length; index++) {
                if (auth[index].name == args.author) {
                    i = index

                }

            }
            if (i >= 0) {
                const a = await Author.findById(auth[i]._id)
                const book = new Book({ title: args.title, published: args.published, genres: args.genres, author: a })
                try {
                    currentUser.friends = currentUser.friends.concat(book._id)
                    await book.save()
                    await currentUser.save()
                } catch (error) {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                }
                pubsub.publish('BOOK_ADDED', { bookAdded: book })
                return book

            }
            else {
                const author = new Author({ name: args.author, born: null })
                const book = new Book({ title: args.title, published: args.published, genres: args.genres, author: author })
                try {
                    await author.save()
                } catch (error) {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                }
                try {
                    currentUser.friends = currentUser.friends.concat(book._id)
                    await book.save()
                    await currentUser.save()
                } catch (error) {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                }
                pubsub.publish('BOOK_ADDED', { bookAdded: book })
                return book

            }


        }
        ,
        editAuthor: async (root, args, context) => {
            const currentUser = context.currentUser
            if (!currentUser) {
                throw new AuthenticationError("not authenticated")
            }
            const author = await Author.findOne({ name: args.name })
            author.born = args.setBornTo
            return author.save()
        },

        createUser: async (root, args) => {
            const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
            return user.save()
                .catch(error => {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password !== 'GraphQL') {
                throw new UserInputError("wrong credentials")
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, JWT_SECRET) }
        }
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        },
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), JWT_SECRET
            )
            const currentUser = await User.findById(decodedToken.id).populate('friends')
            return { currentUser }
        }
    }
})

server.listen().then(({ url, subscriptionsUrl }) => {
    console.log(`Server ready at ${url}`)
    console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})
