# 2.2.1 序列的表示
## 练习2.22
Louis Reasoner试图重写练习2.21中的第一个square_list函数，希望使它能生成一个迭代计算过程:
```javascript
function square_list(items) {
    function iter(things, answer) {
        return is_null(things)
           ? answer
            : iter(tail(things),
                   pair(square(head(things)),
                        answer));
    }
    return iter(items, null);
}
```
不幸的是，在这样声明的square_list生成的结果表里，元素的顺序正好与我们需要的顺序相反。为什么？
Louis又试着修正其程序，交换了pair的参数：
```javascript
function square_list(items) {
    function iter(things, answer) {
        return is_null(things)
          ? answer
            : iter(tail(things),
                   pair(answer,
                        square(head(things))));
    }
    return iter(items, null);
}
```
但还是不行。请解释为什么。

## 解答
* 可参考练习2.18。
* 最终的结果存储在answer中，而结果是依列表顺序存入answer中的，即第一个列表元素存储在最里层的pair中(即list的结尾)。这与调整pair的参数顺序无关，所以无论如何调整，均为逆序。
