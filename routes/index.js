var express = require('express');
var router = express.Router();

// index
router.get('/', (req, res, next) => {

  var data = {
      title: 'Index',
      content: '1ページ目を追加してみた',
      link_users: {href:'/users', text:'usersへ'},
      link_hello: {href:'/hello/1', text:'hello配下のデータベースへ'},
  };    
           
  res.render('index', data);
});

module.exports = router;