var Path = require('path');
var Hapi = require('hapi');
var mongoose = require('mongoose');
var React = require('react');
var Inert = require('inert');
var HapiSass = require('hapi-sass')

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

var sassOptions = {
    src: './public/scripts',
    dest: './public/css',
    force: true,
    debug: true,
    routePath: '/css/{file}.css',
    outputStyle: 'nested',
    sourceComments: true
};
 
server.connection({ port: 3000 });
server.register(Inert, function () {});

//Server Route
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
  path: '/api/search/',
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
  path: '/api/search/{strSearch}',
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

server.register({
        register: HapiSass,
        options: sassOptions
    }
    , function (err) {
        if (err) throw err;
        server.start(function () {
            server.log("Hapi server started @ " + server.info.uri);
        });
    }
);