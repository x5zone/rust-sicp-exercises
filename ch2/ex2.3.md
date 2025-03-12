# 2.1.1 抽象屏障
## 练习2.3
请实现一种平面矩形的表示（提示：你可能希望借用练习2.2的结果）​。基于你的构造函数和选择函数创建几个函数，计算给定矩形的周长和面积等。现在请再为矩形的实现定义另一种表示。你能否设计好你的系统，提供适当的抽象屏障，使同一个周长或者面积函数对两种不同的表示都能工作？

## 解答
* 练习2.2实现了点和线段，对于矩形，可分别通过点和线段来描述，最少可以通过两条线段和三个点完成，不过这样实现的话，没必要，省这一点存储没啥意义。
    * 描述1，矩形的4个线段
    * 描述2，矩形的4个顶点
* 接下来的问题是计算周长和面积，提供抽象屏障是指分层的思考问题，逐层抽象。
    * 假设我们现在实现了矩形的描述1：计算周长的过程中，需要找到长短两条线段，计算2条线段的长度，求和乘2即可；计算面积的过程中，需要找到长短两条线段，计算线段长度并相乘即可。此时，我们已经找到了共有的模式，需要为矩形提供长和宽的方法，避免每次都需要先找这两条长短不一的线段。
    * 假设我们现在实现了矩形的描述2: 计算周长的过程中，需要从第一个点开始，逐个计算临近点和点之间的距离并相加；计算面积的过程中，同样需要计算相邻点之间的距离，并找出大小不同的一对(例如，求max(distance)*min(distance))，然后相乘。
    * 以上，共有的模式：点和点之间的距离(点的方法,线段wrapper一下即可)，找到长短两条线段，这是矩形的长和宽(这个模式多次出现，又是矩形的性质，抽象出来作为矩形的方法)。
* 以上，如果有长和宽的方法，无论底层实现如何，顶层的周长和面积的计算都不需要更改。
* rust代码如下:
```rust
use num::Float;
fn main() {
    // 使用 Rectangle1
    let p1 = Point::new(0.0, 0.0);
    let p2 = Point::new(4.0, 0.0);
    let p3 = Point::new(4.0, 3.0);
    let p4 = Point::new(0.0, 3.0);

    let l1 = Segment::new(p1, p2);
    let l2 = Segment::new(p2, p3);
    let l3 = Segment::new(p3, p4);
    let l4 = Segment::new(p4, p1);

    let rect1 = Rectangle1::new(l1, l2, l3, l4);
    println!("Rectangle1 - Perimeter: {}", rect1.perimeter());
    println!("Rectangle1 - Area: {}", rect1.area());

    // 使用 Rectangle2
    let rect2 = Rectangle2::new(p1, p2, p3, p4);
    println!("Rectangle2 - Perimeter: {}", rect2.perimeter());
    println!("Rectangle2 - Area: {}", rect2.area());
}
trait Rectangle<T: Copy> {
    fn length(&self) -> T;
    fn width(&self) -> T;
    fn perimeter(&self) -> T
    where
        T: Float,
    {
        let p = self.length() + self.width();
        p + p
    }

    fn area(&self) -> T
    where
        T: Float,
    {
        self.length() * self.width()
    }
}

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
    fn distance(&self, other: &Point<T>) -> T {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
}
#[derive(Debug, Copy, Clone)]
struct Segment<T: Copy> {
    start: Point<T>,
    end: Point<T>,
}
impl<T> Segment<T>
where
    T: Float + Copy,
{
    fn new(start: Point<T>, end: Point<T>) -> Self {
        Segment { start, end }
    }

    fn length(&self) -> T {
        self.start.distance(&self.end)
    }
}

struct Rectangle1<T: Copy> {
    l1: Segment<T>,
    l2: Segment<T>,
    l3: Segment<T>,
    l4: Segment<T>,
}
impl<T> Rectangle1<T>
where
    T: Float + Copy,
{
    fn new(l1: Segment<T>, l2: Segment<T>, l3: Segment<T>, l4: Segment<T>) -> Self {
        Rectangle1 { l1, l2, l3, l4 }
    }
}
struct Rectangle2<T: Copy> {
    p1: Point<T>,
    p2: Point<T>,
    p3: Point<T>,
    p4: Point<T>,
}
impl<T> Rectangle2<T>
where
    T: Float + Copy,
{
    fn new(p1: Point<T>, p2: Point<T>, p3: Point<T>, p4: Point<T>) -> Self {
        Rectangle2 { p1, p2, p3, p4 }
    }
}
impl<T> Rectangle<T> for Rectangle1<T>
where
    T: Float + Copy,
{
    fn length(&self) -> T {
        let l1_length = self.l1.length();
        let l2_length = self.l2.length();
        let l3_length = self.l3.length();

        maxf(maxf(l1_length, l2_length), l3_length)
    }
    fn width(&self) -> T {
        let l1_length = self.l1.length();
        let l2_length = self.l2.length();
        let l3_length = self.l3.length();

        minf(minf(l1_length, l2_length), l3_length)
    }
}

impl<T> Rectangle<T> for Rectangle2<T>
where
    T: Float + Copy,
{
    fn length(&self) -> T {
        let l1_length = self.p1.distance(&self.p2);
        let l2_length = self.p2.distance(&self.p3);
        let l3_length = self.p3.distance(&self.p4);

        maxf(maxf(l1_length, l2_length), l3_length)
    }
    fn width(&self) -> T {
        let l1_length = self.p1.distance(&self.p2);
        let l2_length = self.p2.distance(&self.p3);
        let l3_length = self.p3.distance(&self.p4);
        minf(minf(l1_length, l2_length), l3_length)
    }
}

fn maxf<T: Float + Copy>(x: T, y: T) -> T {
    if x > y {
        x
    } else {
        y
    }
}

fn minf<T: Float + Copy>(x: T, y: T) -> T {
    if x < y {
        x
    } else {
        y
    }
}
```