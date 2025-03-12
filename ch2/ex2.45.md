# 2.2.4 实例：一个图形语言
## 练习2.45
函数right_split和up_split可以表述为某种广义划分操作的实例。请声明一个函数split，使它具有如下的性质，求值：
```javascript
const right_split = split(beside, below);
const up_split = split(below, beside);
```
能生成函数right_split和up_split，其行为与前面声明的函数一样。

## 解答
```javascript
function split(op1, op2) {
    return function iter(painter, n) {
        if (n === 0) {
            return painter;
        } else {
            const smaller = iter(painter, n-1);
            return op1(painter, op2(smaller));
        }
    }；
}
```