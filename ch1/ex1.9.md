# 1.2.1 线性递归和迭代
## 练习1.9 
下面两个函数都是基于函数inc（它得到参数加1）和dec（它得到参数减1）声明的，它们各定义了一种得到两个正整数之和的方法。
```javascript
function plus(a, b) {
    return a === 0? b : inc(plus(dec(a), b));
}
function plus(a, b) {
    return a === 0? b : plus(dec(a), inc(b));   
}
```
请用代换模型描绘这两个函数在求值plus(4, 5)时产生的计算过程。这些计算过程是递归的或者迭代的吗？

## 解答
- rust并不支持尾递归优化，所以这两个函数使用rust实现的话，都是递归的。
- plus_1和plus_2的区别在于，plus_1在递归调用返回后，还会执行一次inc操作，而plus_2则不会。对于plus_2而言，旧的栈帧可以安全丢弃。在risc-v的汇编中，有这么一个指令tail,可以在函数调用时，直接跳到新的函数入口处，并丢弃当前栈帧。如果rust支持类似的指令，那么plus_2的实现其实是迭代的。
- 综上，plus_1无论如何都是递归的，而plus_2在支持尾递归优化时，则是迭代的。
```rust
fn main() {
    println!("{}",plus_1(4,5));
    println!("------");
    println!("{}",plus_2(4,5));
}
fn plus_1(a: i32,b: i32) -> i32 {
    //return a === 0? b : inc(plus(dec(a), b));
    println!("plus_1 {} {} begin",a,b);
    let mut x ;
    if a == 0 {
       x=  b
    }else {
        x = plus_1(dec(a), b);
        println!("plus_1 {} {} x {} return",a,b,x);
        // 当递归调用返回时，栈帧上仍有个函数调用，当前栈帧并不能丢弃
        x = inc(x)
    }
    println!("plus_1 {} {} end",a,b);
    x
}
fn plus_2(a: i32,b: i32) -> i32 {
    //return a === 0? b : plus(dec(a), inc(b));
    println!("plus_2 {} {} begin",a,b);
    let x;
    if a == 0 {
       x= b;
    }else {
       x= plus_2(dec(a), inc(b));
       // 当递归调用返回时，当前函数并没有任何事情可做，也没有任何值得保留的信息，所以当前栈帧在递归调用前就可以安全丢弃
    }
    println!("plus_2 {} {} end",a,b);
    x
}
fn dec(n: i32) -> i32 {
    n-1
}
fn inc(n: i32) -> i32 {
    n+1
}
```
- output如下
```
plus_1 4 5 begin
plus_1 3 5 begin
plus_1 2 5 begin
plus_1 1 5 begin
plus_1 0 5 begin
plus_1 0 5 end
plus_1 1 5 x 5 return
plus_1 1 5 end
plus_1 2 5 x 6 return
plus_1 2 5 end
plus_1 3 5 x 7 return
plus_1 3 5 end
plus_1 4 5 x 8 return
plus_1 4 5 end
9
------
plus_2 4 5 begin
plus_2 3 6 begin
plus_2 2 7 begin
plus_2 1 8 begin
plus_2 0 9 begin
plus_2 0 9 end
plus_2 1 8 end
plus_2 2 7 end
plus_2 3 6 end
plus_2 4 5 end
9
```