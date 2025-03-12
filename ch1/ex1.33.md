# 1.3.1 函数作为参数
## 练习1.33
你可以引进一个针对被组合项的过滤器(filter)概念，写出一个更一般的accumulate（练习1.32）版本，对于从给定范围得到的项，该函数只组合起那些满足特定条件的项。这样就得到了一个filtered_accumulate抽象，其参数与上面的累积函数一样，再增加一个表示所用过滤器的谓词参数。请把filtered_accumulate声明为一个函数，并用下面实例展示如何使用filtered_accumulate：
a.区间a到b中的所有素数之和（假定你已经有谓词is_prime）​。
b.求小于n的所有与n互素的正整数（即所有满足GCD(i, n)=1的整数i<n）之乘积。

## 解答
* 代码很长(rust=。=)，但不难。
```rust
use num::Num;
use std::fmt::Debug;

fn main() {
    //a.区间a到b中的所有素数之和（假定你已经有谓词is_prime）​。
    let mut res1 = 0_u64;
    for i in 1..=10000 {
        if is_prime(i) {
            res1 += i
        }
    }
    let res2 = sum_iter(|x| !is_prime(x), |x| x, 1, |x| x + 1, 10000);
    let res3 = sum(|x| !is_prime(x), |x| x, 1, |x| x + 1, 10000);
    println!("res1 {}, res2 {}, res3 {}", res1, res2, res3);
    //b.求小于n的所有与n互素的正整数（即所有满足GCD(i, n)=1的整数i<n）之乘积。
    let mut res1 = 1_u64;
    for i in 1..=42 {
        if gcd(i, 42) == 1 {
            res1 *= i
        }
    }
    let res2 = product_iter(|x| gcd(x, 42) != 1, |x| x, 1, |x| x + 1, 42);
    let res3 = product(|x| gcd(x, 42) != 1, |x| x, 1, |x| x + 1, 42);
    println!("res1 {}, res2 {}, res3 {}", res1, res2, res3);
}

fn filtered_accumlate<T>(
    filter: &impl Fn(T) -> bool,
    combiner: &impl Fn(T, T) -> T,
    null_value: T,
    term: impl Fn(T) -> T,
    a: T,
    next: impl Fn(T) -> T,
    b: T,
) -> T
where
    T: Num + Copy + PartialOrd + std::fmt::Debug,
{
    if a > b {
        null_value
    } else if filter(a) {
        filtered_accumlate(filter, combiner, null_value, term, next(a), next, b)
    } else {
        combiner(
            term(a),
            filtered_accumlate(filter, combiner, null_value, term, next(a), next, b),
        )
    }
}
fn filtered_accumlate_iter<T>(
    filter: &impl Fn(T) -> bool,
    combiner: &impl Fn(T, T) -> T,
    null_value: T,
    term: impl Fn(T) -> T,
    mut a: T,
    next: impl Fn(T) -> T,
    b: T,
) -> T
where
    T: Num + Copy + PartialOrd,
{
    let mut res = null_value;
    while a <= b {
        if filter(a) {
        } else {
            res = combiner(res, term(a));
        }
        a = next(a)
    }
    res
}
fn product<T, F, G, H>(filter: H, term: F, a: T, next: G, b: T) -> T
where
    T: Num + Copy + PartialOrd + std::fmt::Debug,
    F: Fn(T) -> T,
    G: Fn(T) -> T,
    H: Fn(T) -> bool,
{
    let combiner = |x, y| x * y;
    filtered_accumlate(&filter, &combiner, T::one(), term, a, next, b)
}
fn product_iter<T, F, G, H>(filter: H, term: F, a: T, next: G, b: T) -> T
where
    T: Num + Copy + PartialOrd,
    F: Fn(T) -> T,
    G: Fn(T) -> T,
    H: Fn(T) -> bool,
{
    let combiner = |x, y| x * y;
    filtered_accumlate_iter(&filter, &combiner, T::one(), term, a, next, b)
}

fn sum<T, F, G, H>(filter: H, term: F, a: T, next: G, b: T) -> T
where
    T: Num + Copy + PartialOrd + std::fmt::Debug,
    F: Fn(T) -> T,
    G: Fn(T) -> T,
    H: Fn(T) -> bool,
{
    let combiner = |x, y| x + y;
    filtered_accumlate(&filter, &combiner, T::zero(), term, a, next, b)
}
fn sum_iter<T, F, G, H>(filter: H, term: F, a: T, next: G, b: T) -> T
where
    T: Num + Copy + PartialOrd,
    F: Fn(T) -> T,
    G: Fn(T) -> T,
    H: Fn(T) -> bool,
{
    let combiner = |x, y| x + y;
    filtered_accumlate_iter(&filter, &combiner, T::zero(), term, a, next, b)
}
#[inline]
fn smallest_divisor(n: u64) -> u64 {
    find_divisor(n, 2)
}
fn find_divisor(n: u64, test_divisor: u64) -> u64 {
    if test_divisor * test_divisor > n {
        n
    } else if divides(test_divisor, n) {
        test_divisor
    } else {
        find_divisor(n, next(test_divisor))
    }
}
#[inline]
fn next(i: u64) -> u64 {
    if i == 2 {
        3
    } else {
        i + 2
    }
}
#[inline]
fn divides(a: u64, b: u64) -> bool {
    0 == b % a
}
#[inline]
fn is_prime(n: u64) -> bool {
    smallest_divisor(n) == n
}
fn gcd(a: u64, b: u64) -> u64 {
    if b == 0 {
        return a;
    }
    gcd(b, a % b)
}
```
