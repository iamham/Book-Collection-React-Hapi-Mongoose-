//BookCollection (Parent Node)
var BookCollection = React.createClass({
  loadBooksFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleBookSubmit: function(book) {
    var books = this.state.data;
    var newBooks = books.concat([book]);
    this.setState({data: newBooks});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: book,
      success: function(data) {
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }, 
  //Create data var
  getInitialState: function() {
    return {data: []};
  },   
  //Call load data funtion from upper then render
  componentDidMount: function() {
    this.loadBooksFromServer();
  },
  render: function() {
    return (
      <div className="BookCollection">
            <div className="SearchBook">
                
            </div>
            <div className="AddBook">
                <h1>Add New Book</h1>
                <AddBookForm onBookSubmit={this.handleBookSubmit} />
                <BookList data={this.state.data} />
            </div>
      </div>
    );
  }
});

//Div AddBook section --float Right
//Sub Node 1 (Add Form)
var AddBookForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value;
    var genre = React.findDOMNode(this.refs.genre).value;
    var title = React.findDOMNode(this.refs.title).value;
    if (!title) {
      return;
    }
    this.props.onBookSubmit({author: author, genre: genre,title: title});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.title).value = '';
    React.findDOMNode(this.refs.genre).value = '';
  },
  render: function() {
    return (
      <form className="addBookForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Title" ref="title" /><br />
        <input type="text" placeholder="Author" ref="author" /><br />
        <input type="text" placeholder="Genre" ref="genre" /><br />
        <input type="submit" value="Add" />
      </form>
    );
  }
});

//Sub Node 2 (Book List)
var BookList = React.createClass({
  render: function() {
    var bookNodes = this.props.data.map(function(book, index) {
      return (
        <Book author={book.title} key={index}>
         {book.author} {book.genre}
        </Book>
      );
    });
    return (
      <div className="bookList">
        {bookNodes}
      </div>
    );
  }
});

//Sub Node of Book List
var Book = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <div className="book">
        <h2 className="bookTitle">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

React.render(
  <BookCollection url="/api/book" />,
  document.getElementById('content')
);
