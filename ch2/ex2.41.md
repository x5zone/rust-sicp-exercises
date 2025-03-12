# 2.2.3 序列作为约定的接口
## 练习2.41
请写一个函数，它能生成所有小于等于给定整数n的正的相异整数i、j和k的有序三元组，其中每个三元组的三个元之和都等于给定的整数s。

## 解答
* rust代码如下:
```rust
//依赖代码见习题2.17&2.36
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn filter<F>(&self, fun: F) -> List<T>
    where
        F: Fn(&List<T>) -> bool,
    {
        self.accumulate(
            |current, result| {
                if fun(current) {
                    List::pair((*current).clone(), result)
                } else {
                    result
                }
            },
            List::Nil,
        )
    }
}
fn gen_pairs(n: i32) -> List<i32> {
    enumerate_interval(n).flatmap(|i| {
        enumerate_interval(i.value()).flatmap(|j| {
            enumerate_interval(j.value())
                .map(|k| List::from_slice(&[(*i).clone(), (*j).clone(), (*k).clone()]))
        })
    })
}
fn main() {
    use List::*;
    let valid_list = gen_pairs(6).filter(|x| {
        // (a,(b,(c,nil)))
        let (a, b, c) = (
            x.head().value(),
            x.tail().head().value(),
            x.tail().tail().head().value(),
        );
        a + b + c == 10
    });
    println!("{}", valid_list);
}
// Output
// ((5, (4, (1, Nil))), ((5, (3, (2, Nil))), Nil))
