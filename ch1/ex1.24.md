# 1.2.6 实例：素数检测
## 练习1.24
请修改练习1.22的timed_prime_test函数，让它使用fast_is_prime（费马方法）​，并检查你在该练习中找出的12个素数。因为费马检查具有Θ(log n)的增长速度，对于检查接近1000000的素数与检查接近1000的素数，你预期两个时间之间的比较应该怎样？你的数据符合这一预期吗？你能解释所发现的任何不符吗？
```javascript
function expmod(base,exp,m) {
    return exp === 0
        ? 1
        : is_even(exp)
        ? square(expmod(base, exp/2, m)) % m
        : (base * expmod(base, exp-1, m)) % m;
}
function fermat_test(n) {
    function try_it(a) {
        return expmod(a, n, n) === a;
    }
    return try_it(1 + math_floor(math_random() * (n - 1)));
}
function fast_is_prime(n, times) {
    return times === 0
       ? true
        : fermat_test(n)
       ? fast_is_prime(n, times-1)
        : false;
}
```

## 解答
* 按时间复杂度，预期时间比较为2倍。($\sqrt{log{1000000}}/\sqrt{log{1000})}$
* 我的数据为[32,51]，差距约为2倍。
    * 为啥比理论预期时间还快，真不知道=。=
* 相比习题1.22代码，新增代码如下:
```rust
fn expmod(base: u64, exp: u64, m: u64) -> u64 {
    if 0 == exp {
        1
    } else if 0 == exp % 2 {
        (expmod(base, exp / 2, m).pow(2)) % m
    } else {
        (base * expmod(base, exp - 1, m)) % m
    }
}
use rand::{rngs::ThreadRng, Rng};
fn fermat_test(n: u64, rng: &mut ThreadRng) -> bool {
    let try_it = |a| expmod(a, n, n) == a;
    return try_it(rng.gen_range(1..=n - 1));
}

fn fast_is_prime(n: u64, times: u64, rng: &mut ThreadRng) -> bool {
    if times == 0 {
        true
    } else if fermat_test(n, rng) {
        fast_is_prime(n, times - 1, rng)
    } else {
        false
    }
}
fn start_prime_test(n: u64) -> bool {
    //!is_prime(n)
    let mut rng = rand::thread_rng();
    !fast_is_prime(n, 10, &mut rng)
}
```


