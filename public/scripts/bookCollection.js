//BookCollection (Parent Node)
var BookCollection = React.createClass({
      getInitialState: function() {
          return {data: [], update:'Add your book here !'};
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
          this.setState({update: 'Book Added, search your book !',searchQry:' '});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },   
  render: function() {
    return (
      <div className="BookCollection">
            <SearchBookForm  url="/api/search/" />
            <div className="AddBook">
                <h1>ADD NEW BOOK</h1>
                <AddBookForm onBookSubmit={this.handleBookSubmit}  />
                <Lastest data={this.state.update} />
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
    this.props.onBookSubmit({author: author, genre: genre, title: title});
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

var Lastest = React.createClass({
  render: function() {
      console.log(this.props.data);
    return (
      <p>{this.props.data}</p>
    );
  }
});

//Sub Search Form
var SearchBookForm = React.createClass({
    getInitialState: function() {
    return {data: []};
  },
    componentDidMount: function() {
    this.loadBooksFromServer();
  },loadBooksFromServer: function() {
    $.ajax({
      url: '/api/book',
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
  _onChange:function(e){
      e.preventDefault();
      var search = React.findDOMNode(this.refs.search).value;
      console.log(search);
      $.ajax({
      url: this.props.url+search,
      dataType: 'json',
      cache: false,
      type:'GET',
      success: function(data) {
          console.log(data);
          this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      <form className="SearchBook">
        <input type="text" placeholder="Search book... Title, Author or Genre" ref="search" onChange={this._onChange} /><br />
        <BookList data={this.state.data} />
      </form>
    );
  }
});

//Sub Node 2 (Book List)
var BookList = React.createClass({
  render: function() {
      console.log(this.props.data);
      var bookNodes = this.props.data.map(function(book, index) {
      return (
         <Book title={book.title} key={index}>
          Author: {book.author} | Genre: {book.genre}
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
          {this.props.title}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});

//Call to render parent node (BookCollection) @ div content
React.render(
  <BookCollection url="/api/book" />,
  document.getElementById('content')
);
