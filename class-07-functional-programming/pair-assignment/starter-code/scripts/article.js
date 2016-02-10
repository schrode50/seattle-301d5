(function(module) {

function Article (opts) {
  this.author = opts.author;
  this.authorUrl = opts.authorUrl;
  this.title = opts.title;
  this.category = opts.category;
  this.body = opts.body;
  this.publishedOn = opts.publishedOn;
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

Article.loadAll = function(rawData) {
  rawData.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });
  Article.all = rawData.map(function(ele) {
    return new Article(ele);
  });
};

Article.fetchAll = function() {
  if (localStorage.rawData) {
    Article.loadAll(JSON.parse(localStorage.rawData));
    articleView.initIndexPage();
  } else {
    $.getJSON('/data/hackerIpsum.json', function(rawData) {
      Article.loadAll(rawData);
      localStorage.rawData = JSON.stringify(rawData);
      articleView.initIndexPage();
    });
  }
};

Article.numWordsAll = function() {
  return Article.all.map(function(article) {
    return article.body.match(/\b\w+/g).length;
  })
  .reduce(function(a, b) {
    return a + b;
  })
};

Article.allAuthors = function() {
  return Article.all.map(function(article) {
    return article.author;
  })
  .reduce(function(prev, cur) {
      if (prev.indexOf(cur) === -1) {
      prev.push(cur);
    }
    return prev;
  }, []);
};

Article.numWordsByAuthor = function() {
  return Article.allAuthors().map(function(author) {
    var wordCount = Article.all.filter(function(ele, idx) {
      return ele.author === author;
      })
      .map(function(article) {
        return article.body.match(/\b\w+/g).length;
        })
        .reduce(function(x, y) {
        return x + y;
      })
      return {
        name: author,
        count: wordCount
      }
    })
  };
module.Article = Article;
})(window);
