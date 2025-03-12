# 1.1.6 条件表达式和谓词
## 题目1.3
- 请声明一个函数，它以三个数为参数，返回其中较大的两个数的平方和。
---
## 解答
- 浮点数非全序，存在某些浮点数不可比较，例如NaN(not a number)和任何数都不相等。
- 显式处理了不可比较的输入(确实比动态类型代码写起来繁琐一些=。=)，代码如下： 
```rust
use std::ops::{Add, Mul};
fn ch1_3<T>(a: T, b: T, c: T) -> Option<T>
where
    T: PartialOrd + Add<Output = T> + Mul<Output = T> + Copy + std::fmt::Debug,
{
    let minfn = |x: T, y: T| match x.partial_cmp(&y) {
        None => None,
        Some(std::cmp::Ordering::Greater) => Some(y),
        _ => Some(x),
    };
    let minest = minfn(minfn(a, b)?, c)?;

    match minest {
        _ if a == minest => Some(b * b + c * c),
        _ if b == minest => Some(a * a + c * c),
        _ if c == minest => Some(a * a + b * b),
        _ => None,
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_ch1_3() {
        let result = ch1_3(3, 5, 2);
        assert_eq!(result, Some(34));
        let result = ch1_3(1, 2, 3);
        assert_eq!(result, Some(13));
        let result = ch1_3(1, 1, 1);
        assert_eq!(result, Some(2));
        let result = ch1_3(2, 1, 1);
        assert_eq!(result, Some(5));
        let result = ch1_3(5.1, f32::NAN, 10.0);
        assert_eq!(result, None);
    }
}
```
- 另一个版本的代码，使用了迭代器，如下：
```rust
use std::ops::{Add, Mul};
fn ch1_3<T>(a: T, b: T, c: T) -> Option<T>
where
    T: PartialOrd + Add<Output = T> + Mul<Output = T> + Copy + std::fmt::Debug,
{
    let minest = [a, b, c]
        .into_iter()
        .try_fold(a, |acc, x| match acc.partial_cmp(&x) {
            None => None,
            Some(std::cmp::Ordering::Greater) => Some(x),
            _ => Some(acc),
        })?;

    match minest {
        _ if a == minest => Some(b * b + c * c),
        _ if b == minest => Some(a * a + c * c),
        _ if c == minest => Some(a * a + b * b),
        _ => None,
    }
}
```
