# 1.2.4 求幂
## 练习1.17
本节中几个求幂算法的基础都是通过反复做乘法去求乘幂。与此类似，也可以通过反复做加法的方式求出乘积。下面的乘积函数与expt函数类似（在这里假定我们的语言里只有加法而没有乘法）​：
```javascript
function times(a,b) {
    return b === 0
            ? 0
            : a + times(a,b-1);
}
```
这一算法所需的步骤数相对于b是线性的。现在假定除了加法外还有一个函数double，它求出一个整数的两倍；还有函数halve，它把一个（偶）数除以2。请用这些运算设计一个类似fast_expt的求乘积函数，使之只用对数的计算步数。

## 解答
- 代码如下，解释见注释:
```rust
fn main() {
    for i in 0..=10000 {
        assert_eq!(times_recu(1, i), fast_times(1, i))
    }
}
fn times_recu(b: i64, n: i64) -> i64 {
    if n == 0 {
        return 0;
    }
    if n % 2 == 0 {
        times_recu(b, n / 2) * 2 //double
    } else {
        b + times_recu(b, n - 1)
    }
}
fn fast_times(mut b: i64, mut n: i64) -> i64 {
    let mut a = 0;
    while n != 0 {
        // 不断迭代b的累加和，多出来的1，就先加到a上，直至n=0
        if n % 2 == 1 {
            a = a + b
        }
        n = n / 2;
        b = b * 2;
    }
    a
}
```