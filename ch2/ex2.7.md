# 2.1.4 扩展练习：区间算术
## 练习2.7
Alyssa的程序还是不够完整，因为她还没有明确说明区间抽象的实现。这里是区间构造函数的声明：
```javascript
function make_interval(x, y) {
    return pair(x, y);
}
```
请给出选择函数upper_bound和lower_bound的声明，完成这个实现。

## 解答
* 先给出一个js版本的：
```javascript
function upper_bound(interval) {
    return tail(interval);
}
function lower_bound(interval) {
    return head(interval);
}
```
* rust完整代码如下：
```rust
use std::rc::Rc;
type Fx<T> = Rc<dyn Fn(T, T) -> T>;
type Fy<T> = Rc<dyn Fn(Fx<T>) -> T>;
fn pair<T>(x: T, y: T) -> Fy<T>
where
    T: Copy + 'static,
{
    Rc::new(move |m| m(x, y))
}

fn head<T>(z: Fy<T>) -> T {
    z(Rc::new(move |p, _q| p))
}

fn tail<T>(z: Fy<T>) -> T {
    z(Rc::new(move |_p, q| q))
}
fn make_interval<T>(a: T, b: T) -> Fy<T>
where
    T: Copy + 'static,
{
    pair(a, b)
}
fn upper_bound<T>(interval: Fy<T>) -> T {
    tail(interval)
}
fn lower_bound<T>(interval: Fy<T>) -> T {
    head(interval)
}
fn main() {
    let interval = make_interval(3, 7);

    let lower = lower_bound(interval.clone());
    let upper = upper_bound(interval.clone());

    println!("interval: [{}, {}]", lower, upper);

    let interval2 = make_interval(10, 20);
    println!(
        "interval2: lower_bound = {}, upper_bound = {}",
        lower_bound(interval2.clone()),
        upper_bound(interval2.clone())
    );

    let interval3 = make_interval(1.5, 3.7);
    println!(
        "Interval3: lower_bound = {}, upper_bound = {}",
        lower_bound(interval3.clone()),
        upper_bound(interval3.clone())
    );
}
```