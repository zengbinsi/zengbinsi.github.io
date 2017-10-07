# Node.JS使用Sequelize操作MySQL

Node.JS提供了操作数据库的基础接口，我们可以通过mysql模块的query方法进行操作，但是需要编写SQL语句，对于SQL语句并不精通的人来说有一定的难度，而且在代码中保留SQL语句也有一定的危险性。为了方便进行数据库操作，ORM框架应运而生，Sequelize正是这样的模块。

## 安装Sequelize

首先，使用cd命令将终端控制台定位到项目的根目录，然后使用npm安装：


```sh
npm install sequelize --save
```

## 安装mysql2

由于sequelize依赖于mysql2所以也需要安装mysql2：

```sh
npm install mysql2 --save
```

## 编写配置

在项目根目录新建个“configs”文件夹，在文件夹中新建一个名为“mysql-config.js”的文件，代码如下：

```js

var config = {
    dbname: 'testdb',
    uname: 'root',
    upwd: 'root',
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};

module.exports = config;

```

### 配置说明

- dbname: 数据库名称
- uname: 数据库登录名
- upwd: 数据库登录密码
- host: 数据库主机
- port: 数据库端口，mysql默认是3306
- dialect: 数据库类型，这里是mysql
- pool: 连接池配置

【具体配置详见MySQL相关的博客】

## 对sequelize进行简单封装

在项目根目录新建“data”文件夹，在改文件夹中新建“db.js”文件。在db.js中添加以下代码。

**首先，创建sequelize实例：**

```js

// 引入模块
const Sequelize = require('sequelize');
// 读取配置
const mysqlConfig = require('../configs/mysql-config');

// 根据配置实例化seq
var seq = new Sequelize(mysqlConfig.dbname, mysqlConfig.uname, mysqlConfig.upwd, {
    host: mysqlConfig.host,
    dialect: mysqlConfig.dialect,
    pool: mysqlConfig.pool
});

```

**定义一个defineModel函数用于定义数据模型：**

```js

/**
 * 定义数据模型
 * 
 * @param {any} name 模型名称【数据库表名】
 * @param {any} attributes 数据字段集合
 * @returns 数据模型对象
 */
function defineModel (name, attributes) {
    var attrs = {};

    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }

    // 附加公共字段
    // attrs.id = {
    //     type: ID_TYPE,
    //     primaryKey: true
    // };
    attrs.createAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.updateAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.version = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    // 状态：0表示有效，1表示无效，2表示已删除，默认为0.
    attrs.status = {
        type: Sequelize.INTEGER,
        allowNull: false
    };
	
	 // 调用seq的方法定义模型并返回
    return seq.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: function (obj) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    obj.createAt = now;
                    obj.updateAt = now;
                    obj.version = 0;
                } else {
                    obj.updateAt = now;
                    ++obj.version;
                }
            }
        }
    });
}

```

在这里我们可以对模型定义做一些修改，比如添加id、createAt、updateAt、version和status字段等。这样，通过这个函数定义的模型都会带这几个字段，通常一个数据库表都应该包含这些字段。

sequelize默认会为模型添加id字段，自增，主键。所以在这里可以不用关系该字段的定义。


在调用seq.define()方法的时候，设置了“timestamps”为false，当timestamps为true时，默认会为模型添加createAt和updateAt两个字段，数据类型为Sequelize.DATE，这里我们自己定义为Sequelize.BIGINT用于存储时间戳。

同时，设置tableName和模型的名称一致，这样符合我们的惯性思维。


**最后，db.js模块导出defineModel函数：**

```js

exports.defineModel = defineModel;

```

## 定义模型

在data目录下新建“model”文件夹，并在model文件夹中添加“Notices.js”。在Notices中，先引入需要的模块：

```js
var db = require('../db');
var seq = require('sequelize');

```

然后定义数据模型对象：

```js

var Model = db.defineModel('Notices', {
    content: seq.TEXT,
    title: seq.STRING(30),
    startDate: seq.BIGINT,
    expireDate: seq.BIGINT,
    gmId: seq.INTEGER(10),
});

// 导出模型对象
module.exports = Model;

```
引入的db模块就是前面对sequelize的封装，然后通过defineModel()函数定义模型，添加公共字段。

在这里引入sequelize模块主要是为了定义模型的时候指定数据类型。

## 同步数据结构到数据库

当模型定义后，需要在数据库中奖励对应的数据表，这时候需要做结构的同步，可以使用一下方法进行同步：

```js
Model.sync();
```

如果数据库中已经存在改模型对应的表，则不会进行同步操作，如果想要强制进行数据结构的同步，可以公告force参数指定：

```js
Model.sync({force: true});
```


## 使用模型

在Notices.js文件中可以直接使用Model对象进行操作，如果是外部文件，需要先引入Notices模块

```js
var Notices = require('../data/model/Notices');
```

### 添加数据

通过数据模型对象的create方法可以添加一条数据，方法的返回值是一个Promise对象，所以可以直接调用Promise对象的then方法进行后续操作。

```js

Notices.create({
    content: '我是公告内容。',
    title: '系统公告的标题',
    gmId: '10086',
    status: 0,
    expireDate: 1527396599123,
    startDate: Date.now()
}).then((data) => {
    res.json({ code: 0, msg: '公告发布成功', result: data });
});

```

then方法的参数是一个function对象，该function对象有一个data参数，这个data参数就是前面create方法操作的数据对象，可以从data里面获得数据在数据库中的id是什么。

### 通过await和async来实现同步编程效果

通过then的方式很像是嵌套function的回调式异步编程，有些有不喜欢嵌套function的人可以采用await来实现同步编程的效果，更多关于await的用法这里不讨论。

```js

(async () => {
	var data = await Notices.create({
	    content: '我是公告内容。',
	    title: '系统公告的标题',
	    gmId: '10086',
	    status: 0,
	    expireDate: 1527396599123,
	    startDate: Date.now()
	});

	res.json({ code: 0, msg: '公告发布成功', result: data });
})();

```

await修饰的函数调用必须写在async修改的函数里面，否则会报错，所以这里在最外层包了一个即时函数。

**关于即时函数的概念可以参考《JavaScript面向对象编程指南》这本书，里面说的挺详细的。简单说就是定义后立刻调用的一个函数。**

## 修改数据

使用模型对象的update方法可以修改数据：

```js

Notices.update({
    status: 2
}, {
    where: {id: 100}
});

```

updata(values, opts)方法的第一个参数是要修改的数据集合，字段名称和数据表对应。第二个参数是相关的一些操作参数，where用于限制修改的数据的条件，和SQL语句的where作用一样。

上面的效果是修改id为100的数据的status字段的值为2。

## 查询数据

通过数据模型对象的find相关的方法可以实现查询效果：

### 查询所有数据

```js

Notices.findAll();

```

改方法会返回Notices表中所有的数据，返回值依然是一个Promise对象。

### 条件查询

```js

Notices.findAll({order: [['createAt', 'DESC']], limit: 10, where: {'status': 0}});

```

- order字段用于指定排序规则，这里指定以createAt字段做降序排序。
- limit字段用于指定查询的数据量，这里表示返回前10条数据。
- where字段用于指定条件查询，这里表示查询status为0的数据。

## 删除数据

通过数据模型对象的destroy方法可以销毁一条数据，具体用法和查询、修改等类似。

**但是通常我们做删除操作的时候并不是真的将数据从数据库中抹除，而是通过数据的状态字段去标识，方便后续维护。所以每个表通常都会定义一个status字段。**

## 复杂的where条件

在sequelize中，还存在一个Op对象，用于处理复杂的条件操作。

**[案例一]**

```js
var seq = require('sequelize');
var Op = seq.Op;

// 其它代码... 

Model.update({
    status: 2,
    gmId: 10086
}, {
    where: {
        id: {
            [Op.in]: [1, 4, 2, 8, 13, 20]
        }
    }
}); 

```

上面这段代码表示修改status的值为2，修改gmId的值为10086。修改的条件的，数据的id字段必须是在[1, 4, 2, 8, 13, 20]这个数组中的数据。

**[案例二]**

```js

var date = Date.now();

Model.findAll({
    where: {
        status: 0, 
        sendDate: {[Op.lte]: date}, 
        expireDate: {[Op.gte]: date},
        [Op.or]: [
            {to: 1000017},
            {to: 0}
        ]
    }
});

```

上面这段代码表示查询所有sendDate小于等于当前时间，并且expireDate大于等于当前时间，且status的值为0，并且to字段的值为1000017或者为0。


## 参考文档

以上也只是举了一部分例子进行简单说明而已，详细的可以查考这份文档，虽然是英文的，但是稍微花点时间应该多少是可以看懂的。

[http://docs.sequelizejs.com/identifiers.html](http://docs.sequelizejs.com/identifiers.html)


**【写在文末：ORM方便了数据库的操作，但是对于很多复杂的业务，它可能也并不能很好的解决，所以某些特定需求还是需要SQL来实现。】**