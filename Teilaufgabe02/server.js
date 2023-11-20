import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mongoose from "mongoose";
import Todo from "./models/todoSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/styles", express.static("./public/styles"));
app.use("/javascript", express.static("./public/javascript"));

mongoose.connect("mongodb://127.0.0.1:27017/web-tech");

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

const BookType = new GraphQLObjectType({
  name: "Book",
  desscription: "This represents a author of a book",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLString) },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "This represents a list of authors",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    boooks: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId === author.id);
      },
    },
  }),
});

const TodoType = new GraphQLObjectType({
  name: "Todo",
  description: "List of Todos",
  fields: () => ({
    name: { type: GraphQLNonNull(GraphQLString) },
    createdAt: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    todos: {
      type: new GraphQLList(TodoType),
      description: "List of Todos",
      resolve: async () => {
        const todos = await Todo.find();
        console.log(todos);
        return todos;
      },
    },
    book: {
      type: BookType,
      description: "A single  book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of Authors",
      resolve: () => authors,
    },
    author: {
      type: AuthorType,
      description: "A Single Author",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root Mutation",
  fields: (parent, args) => ({
    addTodo: {
      type: TodoType,
      description: "add a Todo",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, args) => {
        return Todo.create({
          name: args.name,
          createdAt: Date.now(),
        });
      },
    },
    deleteTodo: {
      type: TodoType,
      description: "delete a Todo",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        // return await Todo.deleteOne({ name: args.name });
        return await Todo.findOneAndDelete({ name: args.name });
      },
    },
    updateTodo: {
      type: TodoType,
      description: "update a Todo",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        newName: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        return await Todo.findOneAndUpdate(
          { name: args.name },
          { name: args.newName }
        );
      },
    },
    addBook: {
      type: BookType,
      description: "Add a book",
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId,
        };
        books.push(book);
        return book;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use("/graphql", graphqlHTTP({ graphiql: true, schema: schema }));

app.listen(8080, () => {
  console.log("listening on Port 8080");
});
