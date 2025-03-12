# 1.2.6 实例：素数检测
## 练习1.25
Alyssa P.Hacker提出，expmod做了过多的额外工作。她说，毕竟我们已经知道怎样计算乘幂，因此只需要简单地写：
```javascript
function expmod_original(base,exp,m) {
    return exp === 0
        ? 1
        : is_even(exp)
        ? square(expmod(base, exp/2, m)) % m
        : (base * expmod(base, exp-1, m)) % m;
}
function expmod(base,exp,m) {
    return fast_expt(base,exp) % m;
}
function fast_expt(b, n) {
    return n === 0?
        1 :
        n % 2 === 0?
        square(fast_expt(b, n / 2)) :
        b * fast_expt(b, n - 1);    
}
```
她说的对吗？这个函数能很好地服务于我们的快速素数检查程序吗？请解释这些问题。

## 解答
* 在python中没问题，因为python支持任意长度整型，但因为中间结果过大，会导致效率的下降。
* 在rust中，会很快因为溢出而panic，这是因为中间结果溢出，从而无法正常工作。
* 两个版本代码的区别是:是否在y每一次递归过程中都执行`%m`运算。
* rust版本代码如下:
```rust
fn expmod_original(base: u64, exp: u64, m: u64) -> u64 {
    if 0 == exp {
        1
    } else if 0 == exp % 2 {
        // 确保了每次递归返回时，结果都小于m，不会有很大的中间结果
        (expmod(base, exp / 2, m).pow(2)) % m
    } else {
        (base * expmod(base, exp - 1, m)) % m
    }
}
fn expmod(base: u64, exp: u64, m: u64) -> u64 {
    fast_expt(base,exp) % m
}
fn fast_expt(mut b: u64, mut n: u64) -> u64 {
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
