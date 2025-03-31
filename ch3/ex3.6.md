# 3.1.2 引进赋值带来的利益
## 练习3.6
 有时也需要重置随机数生成器，以便从某个特定值开始生成随机数序列。请重新设计一个rand函数，使得可以用字符串"generate"或者字符串"reset"作为参数调用它：rand("generate")生成一个新随机数，而rand("reset")(new-value)将其内部状态变量重置为值new-value。通过重置状态，我们就能重复生成同样的序列。在使用随机数测试程序排除程序错误时，这种功能非常有用。

 ## 解答
 本习题比较简单，不再赘述。
 ```rust
use std::cell::RefCell;
use std::rc::Rc;

use rand::Rng;
use rand::SeedableRng;
use rand::rngs::SmallRng;
use sicp_rs::prelude::*;
fn rand(seed: u64) -> impl Fn(&str) -> List {
    let rng = Rc::new(RefCell::new(SmallRng::seed_from_u64(seed)));
    let dispatch = move |cmd: &str| match cmd {
        "generate" => {
            let mut r = rng.borrow_mut();
            let n = r.random_range(0..100);
            n.to_listv()
        }
        // ClosureWrapper为sicp_rs提供的闭包包装器，用于将闭包转换为List
        "reset" => ClosureWrapper::new({
            let rng = rng.clone();
            move |new_seed: &List| {
                let new_seed = *(new_seed
                    .try_as_basis_value::<u64>()
                    .expect("Expected a u64 value"));
                let mut rng = rng.borrow_mut();
                *rng = SmallRng::seed_from_u64(new_seed);
                Some("done".to_listv())
            }
        })
        .to_listv(),
        _ => panic!("Unknown command"),
    };
    dispatch
}

fn main() {
    let r = rand(42);
    for _ in 0..10 {
        print!("{} ", r("generate"))
    }
    println!();
    r("reset")
        .try_as_basis_value::<ClosureWrapper>()
        .expect("Expected a closure")
        .call(&(42_u64).to_listv());
    for _ in 0..10 {
        print!("{} ", r("generate"))
    }
    println!();
}
// Output:
// 81 31 98 70 79 58 12 60 20 93
// 81 31 98 70 79 58 12 60 20 93
 ```