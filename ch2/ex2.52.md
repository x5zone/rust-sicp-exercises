# 2.2.4 实例：一个图形语言
## 练习2.52
请在上面说的各层次上工作，修改图2.9所示的基于wave的正方极限(square limit)图形。特别是：
a.给练习2.49的基本wave画家加入某些线段（例如，加一个笑脸）​。
b.修改corner_split的构造模式（例如，只用up_split和right_split的图像的各一个副本，而不是两个）​。
c.修改square_limit，换一种使用square_of_four的方式，以另一种不同模式组合各个角区（例如，你可以让最大的Rogers先生从正方形的每个角向外看）​。
```javascript
function corner_split(painter, n) {
    if (n === 0) {
        return painter;
    } else {
        const up = up_split(painter, n-1);
        const right = right_split(painter, n-1);
        const top_left = beside(up, up);
        const bottom_right = below(right, right);
        const corner = corner_split(painter, n-1);
        return beside(
            below(painter, top_left),
            below(bottom_right, corner));
    }
}
function square_limit(painter, n) {
    const quarter = corner_split(painter, n);
    const half = beside(flip_horiz(quarter), quarter);
    return below(flip_vert(half), half);
}
function square_of_four(tl, tr, bl, br) {
    return painter => {
        const top = beside(tl(painter), tr(painter));
        const bottom = beside(bl(painter), br(painter));
        return below(bottom, top);
    }
}
function square_limit(painter, n) {
    const combine4 = square_of_four(flip_horiz, identity, rotate180, flip_vert);
    return combine4(corner_split(painter, n));
}
```

## 解答
* a: wave图形比较复杂，此处使用习题2.49中的菱形作为wave。并在其正中加入一条横线。
```javascript
const segs = segment_list(
            make_segment(make_vect(0,0.5),make_vect(0.5,1)),
            make_segment(make_vect(0.5,1),make_vect(1,0.5)),                
            make_segment(make_vect(1,0.5),make_vect(0.5,0)),
            make_segment(make_vect(0.5,0),make_vect(0,0.5)));
// 通过连接框架各边的中点画出一个菱形的画家。
const wave = segments_to_painter(segs);
// 层次1
const wave_new = segments_to_painter(segment_list(
            // 横线
            make_segment(make_vect(0,0.5),make_vect(1,0.5)),
            // 菱形
            make_segment(make_vect(0,0.5),make_vect(0.5,1)),
            make_segment(make_vect(0.5,1),make_vect(1,0.5)),                
            make_segment(make_vect(1,0.5),make_vect(0.5,0)),
            make_segment(make_vect(0.5,0),make_vect(0,0.5))));
// 层次2
const horiz_seg = segments_to_painter(segment_list(
            // 横线
            make_segment(make_vect(0,0.5),make_vect(1,0.5))));
function painter_combiner(painter1, painter2) {
    return frame => {
        painter1(frame);
        painter2(frame);
    }
}
const wave_new = painter_combiner(wave, horiz_seg);
```
* b: 只用up_split和right_split的图像的各一个副本时，是不可能实现和原本一样的图像模式？
    * 题目中也未要求完全一致的构造模式，仅用一次up_split的话，corner_split如下所示，此时图像已与原图像有所区别。
```javascript
function corner_split(painter, n) {
    if (n === 0) {
        return painter;
    } else {
        const up = up_split(painter, n-1);
        const right = right_split(painter, n-1);
        const corner = corner_split(painter, n-1);
        return beside(
            below(painter, up),
            below(right, corner));
    }
}
```
* c: 例如，你可以让最大的Rogers先生从正方形的每个角向外看
```javascript
// 以tr为例，最大的Rogers在正方形中心位置，现在要挪到正方形的左下角，所以tr的新位置为bl
// function square_of_four(tl, tr, bl, br) {
function square_limit(painter, n) {
    const combine4 = square_of_four(flip_vert, rotate180, identity, flip_horiz);
    return combine4(corner_split(painter, n));
}
```