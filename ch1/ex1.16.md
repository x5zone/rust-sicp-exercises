# 1.2.4 求幂
## 练习1.16
请设计一个函数，它使用一系列的求平方，产生一个迭代的求幂计算过程，但是就像fast_expt那样只需要对数的步数。​（提示：请利用关系$(b^{n/2})^2=(b^2)^{n/2}$，除了指数n和基数b之外，还应该维持一个附加的状态变量a，并定义好状态变换，使得从一个状态转到另一状态时乘积$a·b^n$不变。在计算过程开始时令a取值1，并用计算过程结束时a的值作为回答。一般而言，定义一个不变量，要求它在状态之间保持不变，这一技术是思考迭代算法设计问题时的一种非常强有力的方法。​）
```javascript
function fast_expt(b, n) {
    return n === 0?
        1 :
        n % 2 === 0?
        square(fast_expt(b, n / 2)) :
        b * fast_expt(b, n - 1);    
}
```

## 解答
- 代码如下，解释见注释:
```rust
fn main() {
    for i in 0..=30 {
        assert_eq!(excp_recu(2, i), fast_expt(2, i))
    }
}
fn expt_recu(b: i64, n: i64) -> i64 {
    if n == 0 {
        return 1;
    }
    if n % 2 == 0 {
        excp_recu(b, n / 2).pow(2)
    } else {
        b * excp_recu(b, n - 1)
    }
}
fn fast_expt(mut b: i64, mut n: i64) -> i64 {
    let mut a = 1;
    while n > 0 {
        // 不断迭代b的平方幂，多出来的1，就先乘到a上，直至n=0
        if n % 2 == 1 {
            a = a * b
        }
        n = n / 2;
        b = b * b;
    }
    a
}
```