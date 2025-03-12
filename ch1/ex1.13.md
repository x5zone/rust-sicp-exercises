# 1.2.2 树形递归
## 练习1.13
证明Fib(n)是最接近$\phi^n / \sqrt{5}$的整数，其中$\phi = (1 + \sqrt{5}) / 2$。提示：利用归纳法和斐波那契数的定义（见1.2.2节）​，证明$
Fib(n) = (\phi^n - \psi^n) / \sqrt{5}
$，其中$
\psi = (1 - \sqrt{5}) / 2
$。

## 解答
- 书中似乎已有证明。
- 来一个暴力验证：
```rust
fn main() {
    let phi: f64 = (1.0 + 5f64.sqrt()) / 2f64;
    let psi: f64 = (1.0 - 5f64.sqrt()) / 2f64;

    let mut fibs: Vec<u64> = vec![0, 1];
    for i in 2.. {
        let fib = match fibs[i - 1].checked_add(fibs[i - 2]) {
            Some(value) => value,
            None => {
                println!("Overflow occurred at index {}", i);
                break;
            }
        };
        fibs.push(fib);
        let fib = (phi.powf(i as f64) - psi.powf(i as f64)) / 5f64.sqrt();
        if fibs[i] != fib as u64 {
            println!("{} {} {}", fibs[i], fib, i);
        }
    }
}
```
- output如下，f64精度不够导致：
```
498454011879264 498454011879265.2 72
806515533049393 806515533049395 73
1304969544928657 1304969544928660 74
2111485077978050 2111485077978055.3 75
```