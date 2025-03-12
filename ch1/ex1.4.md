# 1.1.6 条件表达式和谓词
## 题目1.4
 应该注意，我们的求值模型允许函数应用中的函数表达式又是复合表达式，请根据这一认识说明函数a_plus_abs_b的行为：
```javascript
function plus(a,b) { return a+b; }
function minus(a,b) { return a-b; }
function a_plus_abs_b(a,b) {
    return (b>=0?plus:minus)(a,b);
}
```
## 解答
- 答案即为函数名a_plus_abs_b。
- 这一题本来不需要做的，不过rust也可以写这样风格的代码，如下：
-- ps: 在 a_plus_abs_b 中，impl Fn(T, T) -> T 被用作局部变量的类型，Rust 能够推断出它们是同一种具体类型。
```rust
use num::{Num, Zero};
fn a_plus_abs_b<T: Num + Zero + PartialOrd>(a: T, b: T) -> T {
    let plus = |a, b| a + b;
    let minus = |a, b| a - b;
    (if b >= T::zero() { plus } else { minus })(a, b)
}
```