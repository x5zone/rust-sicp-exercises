# 1.2.6 实例：素数检测
## 练习1.28
费马检查的一种不会被骗的变形称为Miller-Rabin检查(Miller 1976, Rabin 1980)，它源于费马小定理的一个变形。该变形断言，如果n是素数，a是任何小于n的正整数，则a的(n-1)次幂与1模n同余。用Miller-Rabin检查考察数n的素数性时，我们随机选取数a< n并用函数expmod求a的(n-1)次幂对n的模。然而，在执行expmod中的平方步骤时，我们要查看是否发现了一个“1取模n的非平凡平方根”​，也就是说，是否存在不等于1或n-1的数，其平方取模n等于1。可以证明，如果1的这种非平凡平方根存在，那么n就不是素数。还可以证明，如果n是非素数的奇数，那么，至少存在一半的a < n，按这种方式计算$a^{n-1}$，会遇到1取模n的非平凡平方根。这也是Miller-Rabin检查不会受骗的原因。请修改expmod函数，让它在发现1的非平凡平方根时报告失败。利用它实现一个类似于fermat_test的函数完成Miller-Rabin检查。通过检查一些已知的素数和非素数的方式考验你的函数。提示：让expmod送出失败信号的一种方便方法是让它返回0。
```javascript
function expmod(base,exp,m) {
    return exp === 0
        ? 1
        : is_even(exp)
        ? square(expmod(base, exp/2, m)) % m
        : (base * expmod(base, exp-1, m)) % m;
}
```

## 解答

* "是否发现了一个“1取模n的非平凡平方根​，也就是说，是否存在不等于1或n-1的数，其平方取模n等于1，如果1的这种非平凡平方根存在，那么n就不是素数。" 对应代码为: 
    ```rust
        if base != 1 && base != m-1 && base*base % m == 1` 
    ```
    * 额外的非平凡平方根检查放置在"执行expmod中的平方步骤时"，可对${base}, {base}^2, {base}^4, {base}^8$...进行非平凡平方根检查，即进行更多检查。
* 对应代码如下:
```rust
fn main() {
    for i in 10..=100000000 {
        let (a, b) = (miller_rabin(i), is_prime(i));
        if a != b {
            println!("{} is_prime = {}, miller_rabin = {},", i, a, b);
        }
    }
}
fn expmod_miller(base: u64, exp: u64, m: u64) -> u64 {
    if 0 == exp {
        1
    } else if 0 == exp % 2 {
        let a = expmod_miller(base, exp / 2, m);
        //非平凡平方根: 是否存在不等于1或n-1的数，其平方取模n等于1
        if a != 1 && a != m - 1  && a*a % m == 1 {
            // 对base起始的，base的平方，4次方，8次方...都进行非平凡平方根判断。
            return 0;
        }
        a*a % m
    } else {
        (base * expmod_miller(base, exp - 1, m)) % m
    }
}
fn miller_rabin(n: u64) -> bool {
    let mut rng = rand::thread_rng();
    for _ in 0..10 {
        let mut a = rng.gen_range(1..=n - 1);
        // if a is a prime, ${a^{n-1}}%n == 1%n
        if expmod_miller(a, n - 1, n) != 1 % n {
            return false;
        }
    }
    true
}
```
* miller_rabin仍为概率算法，将以上代码循环检查次数改为3，仍会受骗。
