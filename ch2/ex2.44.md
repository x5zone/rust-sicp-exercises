# 2.2.4 实例：一个图形语言
## 练习2.44
请声明corner_split里使用的函数up_split，它与right_split类似，但是其中交换了below和beside的角色。
```javascript
function right_split(painter, n) {
    if (n === 0) {
        return painter;
    } else {
        const smaller = right_split(painter, n-1);
        return beside(painter, below(smaller, smaller));
    }
}
```
## 解答
* js代码如下:
```javascript
function up_split(painter, n) {
    if (n === 0) {
        return painter;
    } else {
        const smaller = up_split(painter, n-1);
        return below(painter, beside(smaller, smaller));
    }
}
```
* 对于rust而言，找不到合适可用的绘图包，本节均略过。
