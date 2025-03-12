# 1.2.6 实例：素数检测
## 练习1.27
请证明脚注47中列出的那些Carmichael数确实能骗倒费马检查。也就是说，写一个函数，它以整数n为参数，对每个a< n检查$a^n$是否与a模n同余。然后用你的函数去检查前面给出的那些Carmichael数。
> 脚注47 Carmichael数：561，1105，1729，2465，2821，6601

## 解答
* 代码参考习题1.22和1.24，验证代码如下:
```rust
    let mut rng = rand::thread_rng();
    for i in 10..=100000 {
        if fast_is_prime(i, 4200, &mut rng) != is_prime(i) {
            println!(
                "{} is_prime = {}, fast_is_prime = {}",
                i,is_prime(i),
                fast_is_prime(i, 4200, &mut rng)
            );
        }
    }
```
* output
```
561 is_prime = false, fast_is_prime = true
1105 is_prime = false, fast_is_prime = true
1729 is_prime = false, fast_is_prime = true
2465 is_prime = false, fast_is_prime = true
2821 is_prime = false, fast_is_prime = true
6601 is_prime = false, fast_is_prime = true
```
* 综上，Carmichael数确实能骗倒费马检查。