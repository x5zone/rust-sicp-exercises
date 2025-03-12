# 2.1.3 数据是什么意思？
## 练习2.5
请证明，我们可以只用整数和算术运算，用乘积$2^a·3^b$对应的整数表示非负整数a和b的序对。请给出对应的函数pair、head和tail的声明。

## 解答
```rust
fn pair(x: u64, y: u64) -> u64 {
    2_u64.pow(x.try_into().unwrap()) * 3_u64.pow(y.try_into().unwrap())
}
fn head(mut p: u64) -> u64 {
    let mut h = 0;
    while 0 == p % 2 {
        p = p / 2;
        h += 1;
    }
    h
}
fn tail(mut p: u64) -> u64 {
    let mut t = 0;
    while 0 == p % 3 {
        p = p / 3;
        t += 1;
    }
    t
}
fn main() {
    println!("head: {}", head(pair(3, 4)));
    println!("tail: {}", tail(pair(3, 4)));
}
```