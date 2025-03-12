# 2.1.1 实例：有理数的算术运算
## 练习2.1
请声明make_rat的一个更好的版本，使之可以正确处理正数和负数。make_rat应该把有理数规范化，当有理数为正时使它的分子和分母都是正数；如果有理数为负，那么就应该只让分子为负。
```javascript
function make_rat(n, d) {
    const g = gcd(n, d);
    return pair(n/g, d/g);
}
function numer(x) {
    return head(x);
}
function denom(x) {
    return tail(x);
}
```

## 解答
* 对于大多数编程语言，这个时候就是个struct了，整体比较简单，不用多说。
```rust
fn main() {
    let rat = Rat::new(4, 6); // 使用 i32 类型
    println!(" {:?}", rat);

    let rat64 = Rat::new(100i64, -250i64); // 使用 i64 类型
    println!(" {:?}", rat64);
}
#[derive(Debug)]
struct Rat<T> {
    numerator: T,
    denominator: T,
}
use num::Integer;
use std::ops::Neg;
impl<T> Rat<T>
where
    T: Integer + Copy + Neg<Output = T>,
{
    fn new(numerator: T, denominator: T) -> Self {
        assert!(!denominator.is_zero(), "denominator should not be zero");
        let mut rat = Rat {
            numerator: numerator,
            denominator: denominator,
        };
        rat.simplify();
        rat
    }
    fn numer(&self) -> T {
        self.numerator
    }
    fn denom(&self) -> T {
        self.denominator
    }
    fn simplify(&mut self) {
        let gcd = self.numerator.gcd(&self.denominator);
        self.numerator = self.numerator / gcd;
        self.denominator = self.denominator / gcd;

        if self.denominator.lt(&T::zero()) {
            self.denominator = -self.denominator;
            self.numerator = -self.numerator;
        }
    }
}
```