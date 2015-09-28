var Path = require('path');
var Hapi = require('hapi');
var mongoose = require('mongoose');
var React = require('react');
var Inert = require('inert');

var server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});
mongoose.connect('mongodb://127.0.0.1:27017/bookcollection');

var bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: false },
  genre: { type: String, required: false }
});
var Book = mongoose.model('Book', bookSchema);

server.connection({ port: 3000 });
server.register(Inert, function () {});
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true,
            index: true
        }
    }
});

server.route({
  method: 'GET',
  path: '/api/book',
  handler: function(request, reply) {
    Book.find(function(err, book) {
      if (err) {
        reply(err);
        return;
      }

      reply(book);
    });
  }
});

server.route({
  method: 'GET',
  path: '/api/book/{strSearch}',
  handler: function(request, reply) {
  Book.find().or([{'title':{$regex:request.params.strSearch,'$options':'i'}},
                  {'author':{$regex:request.params.strSearch,'$options':'i'}},
                  {'genre': {$regex:request.params.strSearch,'$options':'i'}}]).exec(function(err, books) {
        reply(JSON.stringify(books));
  });
}});

server.route({
  method: 'POST',
  path: '/api/book',
  handler: function(request, reply) {
    var newBook = new Book({
      title: request.payload.title,
      author: request.payload.author,
      genre: request.payload.genre
    });

    newBook.save(function(err, book) {
      if (err) {
        reply(err);
        return;
      }
      reply(book);
    });
  }
});

server.start(function (err) {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
