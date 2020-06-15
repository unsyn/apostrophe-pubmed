var moment = require('moment');
var CrossRef = require('crossref');

module.exports = function(self, options) {
	// sync route
  self.route('get', 'crossref/:id', function(req, res) {
    if (req.params.id) {
      var id = decodeURIComponent(req.params.id);
      CrossRef.work(id, (err, obj) => {
        if (err) {
          res.status(200).send({status: 'error', body: 'Could not find a matching DOI. ' + err, error: true});
        } else { // ok
          var full = {};
          full.title = obj.title[0];
          full.authors = obj.author && obj.author.map(a =>
              a.family + ' ' + a.given.substr(0, 1) + '.' // improve to handle double-names
          ).join(', ')
          if(obj.type === 'journal-article') {
            full.publicationType = 'journalArticle';
            full.journalYear = obj['published-print'] && obj['published-print']['date-parts'] && obj['published-print']['date-parts'][0] && obj['published-print']['date-parts'][0][0];
            full.doi = obj.DOI
            full.journalTitle = obj['container-title'] && obj['container-title'][0];
            full.journalVolume = obj.volume;
            full.journalIssueNumber = obj['journal-issue'] && obj['journal-issue'].issue;
            full.journalPageNumbers = obj.page;
            full.abstract = obj.abstract;
          } else if(obj.type === 'book' || obj.type === 'book-chapter' || obj.type === 'monograph') {
            full.publicationType = obj.type === 'book-chapter' ? 'bookChapter' : obj.type;
            full.bookPublisher = obj.publisher;
            full.bookPageNumbers = obj.page;
            full.doi = obj.DOI
            full.abstract = obj.abstract;

            const pubLoc = obj['publisher-location']
            if(pubLoc) {
              full.bookCountry = pubLoc.split(', ')[0];
              full.bookCity = pubLoc.split(', ')[1];
            }
            full.bookPublicationYear = obj.issued && obj.issued['date-parts'] && obj.issued['date-parts'][0] && obj.issued['date-parts'][0][0];
          } else if(obj.type === 'web-article') {
            full.publicationType = 'webArticle';
          }
          /*
          full.pubDate = moment(new Date(doc.pubDate)).format('YYYY-MM-DD');
          full.crossrefLink = 'https://api.crossref.org/works/' + doc.doi; // doi, f.i. 10.1016/j.compcom.2005.12.006
          full.year = moment(new Date(full.pubDate)).format('YYYY');
          full.published = moment(new Date(full.pubDate)).format('LL');
          */
          res.status(200).send({status: 'okay', body: full});
        }
      })
    } else {
      res.status(500).send('API Call to CrossRef Failed');
    }
  });
}
