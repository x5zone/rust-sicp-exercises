# 2.2.4 实例：一个图形语言
## 练习2.48
平面上的一条直线段可以用一对向量表示——一个从原点到线段起点的向量，一个从原点到线段终点的向量。请用你在练习2.46做的向量表示定义一种线段表示，其中用到构造函数make_segment以及选择函数start_segment和end_segment

## 解答
```javascript
function make_segment(start, end) {
    // start&end is vect
    return pair(start, end);
}
function start_segment(segment) {
    return head(segment);
}
function end_segment(segment) {
    return tail(segment);
}
```