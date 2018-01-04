# Express-Bookshelf

# Bookshelfの活用

SQLite3を使ってデータベースアクセスをおこなうのは今となっては少数派。

大半はNode.jsのExpressフレームワークを使用する場合はBookshelfでデータベースのCRUDをして、前者よりも遥かに効率的。

# ページネーションの実装

保管されるデータが多くなってきた場合、ページネーションの実装はマスト。

Expressのpaginationプラグインを使うと高速で実現できる（以下の２つの実装を追加するイメージ）

**１．views/hello/index.ejsに以下のソースを記述

|header1|header2|
|:--|--:|
|align left|align right|
|a|b|


`
      <div>
                <span><a href="/hello/1">&lt;&lt; First</a></span>
                ｜
                <span><a href="/hello/<%= pagination.page - 1 %>">&lt;&lt; prev</a></span>
                ｜
                <span><a href="/hello/<%= pagination.page + 1 %>">Next &gt;&gt;</a></span>
                ｜
                <span><a href="/hello/<%= pagination.pageCount %>">Last &gt;&gt;</a></span>
            </div>
`

２．hello.jsにページネーション用の実装をする

・paginationプラグインを使えるようにする
・クエリパラメータの利用
・fetcgPageを実行する
・collection.paginationを利用

