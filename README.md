# Express-Bookshelf

# Bookshelfの活用

SQLite3を使ってデータベースアクセスをおこなうのは今となっては少数派。

大半はNode.jsのExpressフレームワークを使用する場合はBookshelfで前者より遥かに効率的。

# ページネーションの実装

保管されるデータが多くなってきた場合、ページネーション実装はマスト。

Expressのpaginationプラグインを使うと高速で実現できる（以下の２つの実装を追加するイメージ）

**１．views/hello/index.ejsに以下のソースを記述**

|プロパティ|意味|
|:--|:--|
|page|現在のページ番号|
|pageCount|ページ数（＝最後のページ番号）|
|pageSize|1ページあたりのレコード数|
|rawCount|レコードの総数|


```
      <div>
          <span><a href="/hello/1">&lt;&lt; First</a></span>
          ｜
          <span><a href="/hello/<%= pagination.page - 1 %>">&lt;&lt; prev</a></span>
          ｜
          <span><a href="/hello/<%= pagination.page + 1 %>">Next &gt;&gt;</a></span>
          ｜
          <span><a href="/hello/<%= pagination.pageCount %>">Last &gt;&gt;</a></span>
      </div>
```


**２．hello.jsにページネーション用の実装をする**

・paginationプラグインを使えるようにする

・クエリパラメータの利用

・fetchgPageを実行する

・collection.paginationを利用

```
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
```
