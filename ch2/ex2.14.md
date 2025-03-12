# 2.1.4 扩展练习：区间算术
## 练习2.14
请确认Lem说的对。请用各种不同的算术表达式检查这个系统的行为。请构造两个区间A和B，并用它们计算表达式A/A和A/B。如果所用区间的宽度相对于中心值是很小的百分数，你可能会得到更多认识。请检查对中心-百分比形式（见练习2.12）进行计算的结果。

## 解答
* rust代码如下(par1&par2代码在习题2.13):
```rust
fn main() {
    let a = make_center_percent(2.0, 0.01);
    let b = make_center_percent(2.0, 0.03);
    let print_helper = |result: Fy<f64>| {
        println!(
            "result center:{:.3} percent:{:.3} ",
            center(result.clone()),
            percent(result.clone())
        )
    };
    print_helper(par1(a.clone(), b.clone()));
    print_helper(par2(a.clone(), b.clone()));
    print_helper(div_interval(a.clone(), a.clone()));
    print_helper(div_interval(a.clone(), b.clone()));

}
```
* 输出如下，有不同的误差范围:
```
result center:1.002 percent:0.060 
result center:1.000 percent:0.020 
result center:1.000 percent:0.020 
result center:1.001 percent:0.040 
```
* Lem说的对，因为不同的公式误差传播后，导致误差范围不一致。
* "如果所用区间的宽度相对于中心值是很小的百分数，你可能会得到更多认识。"是指：
    * 窄区间的话，误差的传播会近似做加法，其余没看出什么来=。=
    * 窄区间的误差的绝对值增量比较小，这也显然，本来就是很小的误差。我猜可能是对于误差较多次传播的情况下，误差做加法能少的减少误差的传播？
    * 对[center:2.0,percent:0.1]和[center:2.0,percent:0.0001]分别进行了10次的a/a除法，结果如下：
        ```output
        result center:1.817 percent:0.83488 
        result center:1.000 percent:0.00120 
        ```
    * 哈，宽误差区间的center都偏移跑了。