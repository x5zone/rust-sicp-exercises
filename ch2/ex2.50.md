# 2.2.4 实例：一个图形语言
## 练习2.50
请声明变换flip_horiz，它能横向地反转画家。再声明两个变换，它们分别把画家按逆时针方向旋转180°和270°。
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
function flip_horiz(painter) {
    return transform_painter(painter,
                             make_vect(1, 0),
                             make_vect(0, 0),
                             make_vect(1, 1));
}
function rotate180(painter) {
    return transform_painter(painter,
                             make_vect(1, 1),
                             make_vect(0, 1),
                             make_vect(1, 0));    
}
function rotate270(painter) {
    return transform_painter(painter,
                             make_vect(0, 1),
                             make_vect(0, 0),
                             make_vect(1, 1));    
}
```