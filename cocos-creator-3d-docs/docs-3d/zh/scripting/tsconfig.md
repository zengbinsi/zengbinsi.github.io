
## tsconfig

项目中 `tsconfig.json` 的*绝大多数*编译选项并不影响 Cocos Creator 3D 对 Typescript 的编译。
因此，你需要小心配置其中的某些选项，以使得 IDE 的检查功能和 Cocos Creator 3D 的编译行为一致。

----

以下选项不应当显式修改：

- `compilerOptions.target`
- `compilerOptions.module`

例如，若将 `tsconfig.json` 设置为：
```json
{
    "compilerOptions": {
        "target": "es5",
        "module": "cjs"
    }
}
```
那么脚本代码：

```ts
const myModule = require("path-to-module");
```
在（使用 `tsc` 作为检查器的）IDE 中不会引起错误，因为`compilerOptions.module` 设置为了 `cjs`。
然而 Cocos Creator 3D 隐含的 `compilerOptions.module` 是 `es2015`，
因此在运行时它可能提示 "require 未定义" 等错误。

脚本代码：

```ts
const mySet = new Set();
```
对于 Cocos Creator 3D 来说是合法的，但 IDE 可能会报告错误：
因为`compilerOptions.target` 设置为了 `es5`：ECMAScript 2015 才引入 `Set`。

----

对于其他选项，你可以自由修改。

例如，当你希望禁止你项目中所有 Typscript 脚本对隐式 `any` 的使用，
你就可以在 `tsconfig.json` 中将 `compilerOptions.noImplicitAny` 设为 `true`，
如此当你用 Visual Studio Code 等 IDE 检查该文件时就会收到相应的错误提示。

----

对于大多数项目而言，`tsconfig` 的某些选项是固定的，
例如，`compilerOptions.target`、`compilerOptions.module` 以及 Cocos Creator 3D 的类型声明文件位置等。

由于 `tsc` 的良好设计，`extends` 选项使得 `tsconfig.json` 可以是级联的。
Cocos Creator 3D 意识到了这一点，因此，
固定的 `tsconfig` 选项被放置在 {项目路径}/tmp/tsconfig.cocos.json 下，
并由 Cocos Creator 3D 管理。

于是，项目根路径下的 `tsconfig` 可以如下配置以共享这些固定选项：
```
{
    extends: './tmp/tsconfig.cocos.json',
    compilerOptions: {
        /* 自定义的 tsconfig 选项 */
    }
}
```

所幸，当你创建新项目时，编辑器将自动为你生成这样的 `tsconfig`。