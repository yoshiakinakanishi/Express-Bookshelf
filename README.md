# Express-Bookshelf

# Bookshelf

Sqlite3を使ってデータベースアクセスをおこなうのは少数派

大多数はNode.jsを使ってExpressを使用する場合、Bookshelfを使っており、遥かに効率がいい。

# ページネーション

保管されるデータが多くなってきた場合、やはりページネーションは実装しておくのがデファクト

paginationプラグインを使うと高速で実装できる

１．views/hello/index.ejsに以下を記述

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

