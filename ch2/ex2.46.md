# 2.2.4 实例：一个图形语言
## 练习2.46
从原点出发到某个点的二维向量v，可以用由x坐标和y坐标构成的序对表示。请为这种向量实现一个数据抽象：给出其构造函数make_vect以及对应的选择函数xcor_vect和ycor_vect。基于你的构造函数和选择函数，实现函数add_vect、sub_vect和scale_vect，使它们能完成向量加法、向量减法和向量的缩放。
$$(x1, y1)+(x2, y2)=(x1+x2, y1+y2)$$
$$(x1, y1)-(x2, y2)=(x1-x2, y1-y2)$$
$$s·(x, y)=(sx, sy)$$

## 解答
```javascript
function make_vect(x, y) {
    return pair(x, y);
}
function xcor_vect(v) {
    return head(v);
}
function ycor_vect(v) {
    return tail(v);
}
function add_vect(v1, v2) {
    return make_vect(xcor_vect(v1)+xcor_vect(v2), ycor_vect(v1)+ycor_vect(v2));
}
function sub_vect(v1, v2) {
    return make_vect(xcor_vect(v1)-xcor_vect(v2), ycor_vect(v1)-ycor_vect(v2));
}
function scale_vect(s, v) {
    return make_vect(s*xcor_vect(v), s*ycor_vect(v));
}
```