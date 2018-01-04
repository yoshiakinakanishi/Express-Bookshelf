var express = require('express');
var router = express.Router();
    
var sqlite3 = require('sqlite3'); // ★追加

// データベースオブジェクトの取得
// 自分で作ったデータベース名を引数に指定
var db = new sqlite3.Database('mydb.sqlite3');

// ★以下を追加
var knex = require('knex')({
  dialect: 'sqlite3', // 使用するデータベースの種類
  connection: { // データベースへの接続の種類で「filename」というファイル名を示す値だけを用意
    filename: 'mydb.sqlite3' 
  },
  useNullAsDefault: true // SQLiteを利用する場合のみtrueを指定
});

//Bookshelfのロード
var Bookshelf = require('bookshelf')(knex);

// MyDataモデルの作成
// モデル＝データベースにあるテーブルを扱うためのオブジェクト
// BookshelfのModel.extend()というメソッドを利用して、引数にはテーブルの名前を指定
var MyData = Bookshelf.Model.extend({
   tableName: 'mydata' 
});

// ---------------------------------------------------------------

// /helloにアクセスするとmydataのレコードが一覧表示される
// 今回はSQLを一切使わず、Bookshelfのみでデータの取り出しをおこなう
// fetchAll()メソッドは、すべてのレコードを取得する
// then()メソッドは、データベースアクセス完了後の処理をコールバック関数として設定
// then()メソッドのコールバック関数の引数collectionは、データベースから取り出されたレコードデータをまとめたもの

router.get('/', (req, res, next) => {
    new MyData().fetchAll().then((collection) => {
        var data = {
            title: 'Hello',
            content: collection.toArray()
        };
        res.render('hello/index', data);
    })
    .catch((err) => {
       res.status(500).json({error: true, data: {message: err.message}}); 
    })
});

// ---------------------------------------------------------------

// /hello/addでフォームを送信すると/helloのテーブルに追加される　※今回はバリデーションは省略
// router.get('/add, ・・・)は、今回はそのままにしておく

router.get('/add', (req, res, next) => {
    var data = {
        title: 'Hello/Add',
        content: '新しいレコードを入力：',
        form: {name:'', mail:'', age:0}
    }
    res.render('hello/add', data);
});

router.post('/add', (req, res, next) => {
    var response = res;
    
    // MyDataの引数にreq.bodyを指定すれば、送信されたフォームの値がそのままMyDataの値として設定される
    // save()メソッドは、送信されたフォームの値、MyDataオブジェクトをテーブルに保存される
    new MyData(req.body).save().then((model) => {　
       response.redirect('/hello'); 
    });
});
    
// ---------------------------------------------------------------

router.get('/show', (req, res, next) => {
   var id = req.query.id;
   db.serialize(() => {
       var q ="select * from mydata where id = ?";
       db.get(q, [id], (err, row) => {
           if (!err) {
               var data = {
                   title: 'Hello/show',
                   content: 'id = ' + id + ' のレコード：',
                   mydata: row
               }
               res.render('hello/show', data);
           }
       });
   });
});

// ---------------------------------------------------------------

router.get('/edit', (req, res, next) => {
   var id = req.query.id;
   db.serialize(() => {
      var q = "select * from mydata where id = ?";
      db.get(q, [id], (err, row) => {
          if (!err) {
              var data = {
                  title: 'hello/edit',
                  content: 'id = ' + id + 'のレコードを編集：',
                  mydata: row
              }
              res.render('hello/edit', data);
          }
      })
   });
});

router.post('/edit', (req, res, next) => {
   var id = req.body.id;
   var nm = req.body.name;
   var ml = req.body.mail;
   var ag = req.body.age;
   var q = "update mydata set name = ?, mail = ?, age = ? where id = ?";
   db.run(q, nm, ml, ag, id);
   res.redirect('/hello');
});

// ---------------------------------------------------------------

router.get('/delete', (req, res, next) => {
    var id = req.query.id;
    db.serialize(() => {
        var q = "select * from mydata where id = ?";
        db.get(q, [id], (err, row) => {
            if (!err) {
                var data = {
                    title: 'Hello/Delete',
                    content: 'id =' + id + 'のレコード削除：',
                    mydata: row
                }
                res.render('hello/delete', data); // パスの指定に注意（/hello/deleteは誤り）
            }
        });
    });
});

router.post('/delete', (req, res, next) => {
   var id = req.body.id;
   var q = "delete from mydata where id = ?";
   db.run(q, id);
   res.redirect('/hello');
});

// ---------------------------------------------------------------

// /hello/findにアクセスして、id番号を入力して送信すると、そのID番号のレコードを探して内容を表示する

router.get('/find', (req, res, next) => {
    var data = {
        title: '/Hello/Find',
        content: '検索IDを入力：',
        form: {fstr:''},
        mydata: null
    };
    res.render('hello/find', data);
});

router.post('/find', (req, res, next) => {
    new MyData().where('id', '=', req.body.fstr).fetch().then((collection) => {
        var data = {
            title: 'Hello!',
            content: '※id = ' + req.body.fstr + ' の検索結果：',
            form: req.body,
            mydata:　collection
        };
        res.render('hello/find', data);
    })
});

// ---------------------------------------------------------------

// ページネーション＝データベースから特定のページのデータだけを取り出して渡す
// /hello/1にアクセスすると、レコードの下にTOP/Prev/Next/ladtと移動リンクが表示される
// /hello/2・3・・・とすると、その該当ページ番号のレコードが表示される

Bookshelf.plugin('pagination'); //★fetchPage追加

router.get('/:page', (req, res, next) => {
    var pg = req.params.page;
    pg *= 1;
    if (pg < 1){ pg = 1; } // 取り出した値を整数にして、1未満だったら1にして正常な値がページ番号に指定されるように調整
    
    // fetchPageはfetchAllのページネーション版
    // pageSizeでそのページで表示するレコード行数が変更できる
    
    new MyData().fetchPage({page:pg, pageSize:3}).then((collection) => {
        var data = {
            title: 'Hello!',
            content: collection.toArray(),
            pagination: collection.pagination
        };
        console.log(collection.pagination);
        res.render('hello/index', data);
   })
   .catch((err) => {
        res.status(500).json({error: true, data: {message: err.message}});
   });
});

module.exports = router;