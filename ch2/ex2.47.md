# 2.2.4 实例：一个图形语言
## 练习2.47
下面是框架的两个可能的构造函数:
```javascript
function make_frame(origin, edge1, edge2) {
    return list(origin, edge1, edge2)
}
function make_frame(origin, edge1, edge2) {
    return pair(origin, pair(edge1, edge2))
}
```
请为每个构造函数提供合适的选择函数，构造出框架的相应实现。

## 解答
```javascript
// for list
// 构造函数: list(origin, edge1, edge2)
function origin_frame(frame) {
    return head(frame);
}
function edge1_frame(frame) {  // edge1是一个用于坐标变换的向量，可能为负值
    return head(tail(frame));
}
function edge2_frame(frame) {  // edge2也是一个用于坐标变换的向量，可能为负值
    return head(tail(tail(frame)));
}
// for pair
// 构造函数: pair(origin, pair(edge1, edge2))
function origin_frame(frame) {
    return head(frame);
}
function edge1_frame(frame) {
    return head(tail(frame));
}
function edge2_frame(frame) {
    return tail(tail(frame));
}
```