# 3.1.2 引进赋值带来的利益
## 练习3.5
 蒙特卡罗积分是一种使用蒙特卡罗模拟估计定积分值的方法。考虑由谓词P(x, y)描述的区域的面积计算问题，该谓词对区域里的点(x, y)为真，对不在区域里的点为假。举例说，检查公式(x-5)2+(y-7)2≤32是否成立的谓词，就描述了以(5, 7)为圆心的半径为3的圆所围的区域。要估计这种由谓词描述的区域的面积，我们首先选一个包含该区域的矩形。例如，以(2, 4)和(8, 10)为对角点的矩形包含了上面的圆，要考虑的积分就是这一矩形中位于所关注区域内部的那一部分。我们可以用下面的方法估计积分值：随机选取位于矩形里的点(x,y)，通过检查P(x, y)确定该点是否位于考虑的区域内。如果检查的点足够多，那么落在区域内的点的比例，应该能用于估计矩形中被考虑区域的面积的比例。这样，用这个比例乘以整个矩形的面积，就能得到相应积分的一个估计值。
 请把蒙特卡罗积分实现为一个函数estimate_integral，它以一个谓词P，矩形的上下边界x1、x2、y1和y2，以及为产生估计值而要求做试验的次数为参数。你的函数应该使用上面用于估计π值的那个monte_carlo函数。请用你的estimate_integral，通过对单位圆面积的度量生成π的一个估计值。
 你可能发现，能选取给定范围里的随机数的函数非常有用。下面的random_in_range函数利用1.2.6节用过的random实现这一功能，它返回小于其参数的非负随机整数：
 ```javascript
 function random_in_range(low, high) {
     const range = high - low;
     return low + math_random() * range;
 }
 function monte_carlo(trials, experiment) {
    function iter(trials_remaining, trials_passed) {
        return trials_remaining === 0
               ? trials_passed / trials
               : experiment()
               ? iter(trials_remaining - 1, trials_passed + 1)
               : iter(trials_remaining - 1, trials_passed);
    }
    return iter(trials, 0);
}
 ```

 ## 解答
 本习题比较简单，不再赘述。
 ```rust
 use rand::Rng;

fn random_in_range(low: f64, high: f64) -> f64 {
    let mut rng = rand::rng();
    rng.random_range(low..high)
}
fn monte_carlo(trials: i32, experiment: impl Fn(i32) -> bool) -> f64 {
    // 递归实现迭代次数过多会导致栈溢出
    // fn iter(
    //     trials_remaining: i32,
    //     passed: i32,
    //     trials: i32,
    //     experiment: impl Fn(i32) -> bool,
    // ) -> f64 {
    //     if trials_remaining == 0 {
    //         return passed as f64 / trials as f64;
    //     }
    //     let passed = if experiment(trials_remaining) {
    //         passed + 1
    //     } else {
    //         passed
    //     };
    //     iter(trials_remaining - 1, passed, trials, experiment)
    // }
    // iter(trials, 0, trials, experiment)
    let mut passed = 0;
    for _ in 0..trials {
        if experiment(trials) {
            passed += 1;
        }
    }
    passed as f64 / trials as f64
}
fn estimate_integral(p: impl Fn(f64, f64) -> bool, x1: f64, x2: f64, y1: f64, y2: f64) -> f64 {
    let trials = 10000000;
    monte_carlo(trials, |_| {
        let x = random_in_range(x1, x2);
        let y = random_in_range(y1, y2);
        p(x, y)
    })
}
fn main() {
    let p = |x: f64, y: f64| x * x + y * y <= 1.0;
    let result = estimate_integral(p, -1.0, 1.0, -1.0, 1.0);
    println!("{}", result * 4.0); // 3.140968
}
```