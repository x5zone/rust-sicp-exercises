# 2.2.4 实例：一个图形语言
## 练习2.49
利用segments_to_painter定义下面的基本画家：
a.画出给定框架边界的画家。
b.通过连接框架两对角点，画出一个大叉子的画家。
c.通过连接框架各边的中点画出一个菱形的画家。
d.画家wave。

```javascript
function segments_to_painter(segment_list) {
    return frame =>
    for_each(
        segment =>
        draw_line(
            frame_coord_map(frame)(start_segment(segment)),
            frame_coord_map(frame)(end_segment(segment))),
        segment_list);
}
```

## 解答
> 我们将用单位正方形(0≤x, y≤1)里的坐标描述图像的位置。对于每个框架，我们要为它关联一个框架坐标映射，利用这个映射实现相关图像的位移和伸缩，使之适配于这个框架。这个映射的功能就是把单位正方形变换到相应的框架，也就是把向量v=(x, y)映射到下面的向量和：Origin(Frame)+x·Edge1(Frame)+y·Edge2(Frame)
> 例如，点(0, 0)将映射到给定框架的原点，(1, 1)映射到与原点对角的那个点，而(0.5, 0.5)映射到给定框架的中心点。
* a: 不需要关心具体的frame，直接构造在单位正方形里的线段即可。
```javascript
const segs = segment_list(
            make_segment(make_vect(0,0),make_vect(0,1)),
            make_segment(make_vect(0,0),make_vect(1,0)),
            make_segment(make_vect(0,1),make_vect(1,1)),
            make_segment(make_vect(1,0),make_vect(1,1)));
// 画出给定框架边界的画家。
segments_to_painter(segs)
```
* b: 
```javascript
const segs = segment_list(
            make_segment(make_vect(0,0),make_vect(1,1)),
            make_segment(make_vect(1,0),make_vect(0,1)));
// 通过连接框架两对角点，画出一个大叉子的画家。
segments_to_painter(segs)
```
* c:
```javascript
const segs = segment_list(
            make_segment(make_vect(0,0.5),make_vect(0.5,1)),
            make_segment(make_vect(0.5,1),make_vect(1,0.5)),                
            make_segment(make_vect(1,0.5),make_vect(0.5,0)),
            make_segment(make_vect(0.5,0),make_vect(0,0.5)));
// 通过连接框架各边的中点画出一个菱形的画家。
segments_to_painter(segs)
```
* d:
这个图像比较复杂，略过。