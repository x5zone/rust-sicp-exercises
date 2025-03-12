# 2.1.1 抽象屏障
## 练习2.2
请考虑平面上线段的表示问题。一个线段可以用两个点来表示，一个是线段的始点，另一个是终点。请声明构造函数make_segment和选择函数start_segment、end_segment，它们基于点的概念定义线段的表示。进而，点可以表示为两个数的序对，这两个成分分别表示点的x坐标和y坐标。请据此进一步给出定义这种表示的构造函数make_point和选择函数x_point、y_point。最后，请基于所定义的构造函数和选择函数，声明一个函数midpoint_segment，它以一个线段为参数，返回线段的中点（也就是坐标值是两个端点的平均值的那个点）​。为试验这些函数，你还需要有一种打印点的方法，例如：
```javascript
function print_point(p) {
    return "(" + stringify(x_point(p)) + ", " + stringify(y_point(p)) + ")";
}
```

## 解答
* 这种习题用python应该非常简单吧，python代码不给出了。
* rust代码如下:
```rust
fn main() {
    let p1 = Point::new(0.0, 0.0);
    let p2 = Point::new(4.0, 4.0);
    let segment = Segment::new(p1, p2);
    println!(
        "{},{}",
        segment.start_segment(),
        segment.end_segment()
    );

    let midpoint = midpoint_segment(segment);
    println!("mid: {}", midpoint);
}
use std::fmt::{self, Display};

use num::Float;
#[derive(Debug, Copy, Clone)]
struct Point<T: Copy> {
    x: T,
    y: T,
}
impl<T> Point<T>
where
    T: Float + Copy,
{
    fn new(x: T, y: T) -> Self {
        Point { x, y }
    }
    fn x_point(&self) -> T {
        self.x
    }
    fn y_point(&self) -> T {
        self.y
    }
}
impl<T: Display + Float + Copy> fmt::Display for Point<T> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x_point(), self.y_point())
    }
}
#[derive(Debug, Copy, Clone)]
struct Segment<T: Copy> {
    start: Point<T>,
    end: Point<T>,
}
impl<T> Segment<T>
where
    T: Copy,
{
    fn new(start: Point<T>, end: Point<T>) -> Self {
        Segment { start, end }
    }
    fn start_segment(&self) -> Point<T> {
        self.start
    }
    fn end_segment(&self) -> Point<T> {
        self.end
    }
}
fn midpoint_segment<T>(seg: Segment<T>) -> Point<T>
where
    T: Float + Copy,
{
    let mid_x =
        (seg.start_segment().x_point() + seg.end_segment().x_point()) / T::from(2.0).unwrap();
    let mid_y =
        (seg.start_segment().y_point() + seg.end_segment().y_point()) / T::from(2.0).unwrap();
    Point::<T>::new(mid_x, mid_y)
}
```