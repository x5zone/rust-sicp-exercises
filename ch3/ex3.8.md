# 3.1.3 引进赋值的代价
## 练习3.8
我们在1.1.3节定义求值模型时曾经说过，求值表达式的第一步是求值其子表达式。但那时没说将按怎样的顺序去求值子表达式（例如，是从左到右还是从右到左）​。引进赋值之后，对运算符组合式里各运算对象的不同求值顺序有可能导致不同的结果。请定义一个简单的函数f，使得对f(0)+f(1)的求值，当+对运算对象采用从左到右的求值顺序时返回0，而对运算对象采用从右到左的求值顺序时返回1。

## 解答
本习题比较简单，不再赘述。
```rust
fn make_f() -> impl FnMut(i32) -> i32 {
    let mut x = 1;
    // FnMut 的调用特性只表示闭包可以修改自身的状态，但它并不限定闭包如何捕获外部变量，并不一定是按可变引用捕获。
    let closure = move |y: i32| {
        x *= y;
        x
    };
    closure
}
fn main() {
    let mut f = make_f();
    println!("rust: f(0) + f(1) = {}", f(0) + f(1));

    let mut f = make_f();
    let a = f(0);
    let b = f(1);
    println!("from left to right: f(0) + f(1) = {}", a + b);
    let mut f = make_f();
    let a = f(1);
    let b = f(0);
    println!("from right to left: f(0) + f(1) = {}", a + b);
}
```