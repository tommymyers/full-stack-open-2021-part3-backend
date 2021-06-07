require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const app = express()
const Person = require("./models/person")

morgan.token("body", (request, response) => {
  return request.method === "POST" ? JSON.stringify(request.body) : ""
})

app.use(express.static("build"))
app.use(cors())
app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.json(people)
    })
    .catch((error) => next(error))
})

app.get("/api/persons/:id", (request, response, next) => {
  const id = Number(request.params.id)
  const person = persons.find((p) => p.id === id)
  if (person) response.json(person)
  else response.status(404).end()
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post("/api/persons", (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    })
  }

  if (!body.number) {
    return response.status(409).json({
      error: "number missing",
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: "name missing",
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: "number missing",
    })
  }

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => next(error))
})

app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>${new Date()}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }

  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`)
})
