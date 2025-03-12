# 2.2.4 实例：一个图形语言
## 练习2.51
请声明对画家的below操作。函数below以两个画家为参数。below生成的画家针对给定的框架，要求其第一个参数画家在框架的下半部画图，第二个参数画家在框架的上半部画图。请按两种方式声明below：第一个用类似上面beside函数的方式直接声明，另一个则通过调用beside和适当的旋转（来自练习2.50）完成工作。
```javascript
function frame_coord_map(frame) {
    return v => add_vect(origin_frame(frame), 
                         add_vect(scale_vect(xcor_vect(v), 
                                             edge1_frame(frame)), 
                                  scale_vect(ycor_vect(v), 
                                             edge2_frame(frame))));
}
function transform_painter(painter, origin, corner1, corner2) {
    return frame => {
             const m = frame_coord_map(frame);
             const new_origin = m(origin);
             return painter(make_frame(
                                new_origin,
                                sub_vect(m(corner1), new_origin),
                                sub_vect(m(corner2), new_origin)));
           };
}
```
## 解答
```javascript
// 声明方式1
function below(painter1, painter2) {
    const split_horiz = make(0, 0.5);
    const paint_bottom = transform_painter(painter1,
                                           make_vect(0, 0),
                                           make_vect(1, 0),
                                           split_horiz);
    const paint_top    = transform_painter(painter2,
                                           split_horiz,
                                           make_vect(1, 0.5),
                                           make_vect(0, 1));
    return frame => {
        paint_bottom(frame);
        paint_top(frame);
    }
}
// 声明方式2
function below(painter1, painter2) {
    return rotate270(beside(rotate90(painter1), rotate90(painter2)));
}
```