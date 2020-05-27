# apostrophe-crossref

Simple `apostrophe-pieces` subclass with extra editor modal interface that uses one of your schema fields as a sync input from the CrossRef API.

## in app.js

```javascript
modules: {
  'my-module-that-extends-pieces': {
    crossref: {
      enhanceField: 'crossrefId',
      // required, it is one of your schema field names where the editor will paste in a DOI
      // this field will be enhanced with a Sync from CrossRef button in the editor modal
      mapFields: {
        'title' : 'title',
        'abstractPiece' : 'abstract',
        'authors' : 'authors',
        'pubDate' : 'pubDate'
      },
      // required, key is Piece field name, value is crossref document key
    }
  }
}
```
