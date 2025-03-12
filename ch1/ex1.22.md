# 1.2.6 实例：素数检测
## 练习1.22
假设有一个无参数的基本函数get_time，它返回一个整数，表示从1970年1月1日的00:00:00起到现在已经过去的微秒数。如果对整数n调用下面的timed_prime_test函数，它将打印出n，然后检查n是否素数。如果n是素数，函数将打印出三个星号，随后是执行这一检查所用的时间量。
```javascript
function timed_prime_test(n) {
    display(n);
    return start_prime_test(n, get_time());
}
function start_prime_test(n, start_time) {
    return is_prime(n)
        ? report_prime(get_time() - start_time)
        : true;
}
function report_prime(elapsed_time) {
    display(" *** ");
    display(elapsed_time);
}
```
请利用这个函数写一个search_for_primes函数，它检查给定范围内连续的各个奇数的素性。请用你的函数找出大于1000、大于10000、大于100000和大于1000000的最小的三个素数。请注意检查每个素数所需的时间。因为这一检查算法具有$O(\sqrt{n})$的的增长阶，你可以期望在10000附近的素数检查耗时大约为在1000附近的素数检查的$\sqrt{10}$倍。你得到的数据确实如此吗？由100000和1000000得到的数据，对这一$\sqrt{n}$预测的支持情况如何？概念上说，在你的机器上运行的时间正比于计算所需的步数，你的结果符合这一说法吗？

## 解答
* [0,2,7,16]，基本符合$\sqrt{10}$，约为3倍左右。
* 代码稍做修改(增加多次循环求均值，减少过多打印)，如下:
```rust
fn main() {
    const LOOPS: u128 = 10000;

    for j in [1000_u64, 10000, 100000, 1000000] {
        let mut elapsed_time = 0_u128;
        for _ in 0..LOOPS {
            let mut i = j;
            let mut flag = 0;
            let start_time = get_time();
            while flag < 3 {
                if !timed_prime_test(i) {
                    flag += 1;
                }
                i += 1
            }
            elapsed_time += get_time() - start_time
        }
        report_prime(elapsed_time / LOOPS);
    }
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
        //find_divisor(n, next(test_divisor))
        find_divisor(n, test_divisor + 1)
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
use std::time::{SystemTime, UNIX_EPOCH};
fn get_time() -> u128 {
    let start = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    start.as_micros()
}
fn timed_prime_test(n: u64) -> bool {
    //println!("{}", n);
    start_prime_test(n)
}
fn start_prime_test(n: u64) -> bool {
    !is_prime(n)
}
fn report_prime(elapsed_time: u128) {
    println!(" *** {}", elapsed_time);
}
```