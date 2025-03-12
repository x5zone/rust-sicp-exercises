# 1.2.6 实例：素数检测
## 练习1.21
请用smallest_divisor函数找出下面各数的最小因子：199，1999，19999。
```javascript
function smallest_divisor(n) {
    return find_divisor(n, 2);
}
function find_divisor(n, test_divisor) {
    return square(test_divisor) > n
        ? n
        : divides(test_divisor, n)
            ? test_divisor
            : find_divisor(n, test_divisor + 1);
}
function divides(a, b) {
    return b % a === 0;
}
function is_prime(n) {
    return n === smallest_divisor(n);
}
```

## 解答
* 依次为199，1999，7。代码如下:
```rust
fn main() {
    println!("{}", smallest_divisor(199));
    println!("{}", smallest_divisor(1999));
    println!("{}", smallest_divisor(19999));
}
fn smallest_divisor(n: u64) -> u64 {
    find_divisor(n, 2)
}
fn find_divisor(n: u64, test_divisor: u64) -> u64 {
    if test_divisor * test_divisor > n {
        n
    } else if divides(test_divisor, n) {
        test_divisor
    } else {
        find_divisor(n, test_divisor + 1)
    }
}
fn divides(a: u64, b: u64) -> bool {
    0 == b % a
}
```