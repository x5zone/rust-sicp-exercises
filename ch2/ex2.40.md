# 2.2.3 序列作为约定的接口
## 练习2.40
请写一个函数unique_pairs，给它一个整数参数n，它产生所有序对(i, j)的序列，其中$1≤j<i≤n$。请用unique_pairs简化上面prime_sum_pairs的定义。

参考
```javascript
// 生成(i,j)序对
accumulate(append,
           null,
           map(i => map(j => list(i, j),
                       enumerate_interval(1, i - 1)),
               enumerate_interval(1, n)));
function flatmap(f, seq) {
    return accumulate(append, null, map(f, seq));
}
function is_prime_sum(pair) {
    return is_prime(head(pair) + head(tail(pair)));
}
function make_pair_sum(pair) {
    return list(head(pair), head(tail(pair)), head(pair) + head(tail(pair)));
}
function prime_sum_pairs(n) {
    return map(make_pair_sum,
               filter(is_prime_sum,
                      flatmap(i => map(j => list(i, j),
                                       enumerate_interval(1, i - 1)),
                              enumerate_interval(1, n))));
}
function permutations(s) {
    return is_null(s)
        ? list(null)
        : flatmap(x => map(p => pair(x, p),
                          permutations(remove(x, s))),
                  s);
}
function remove(item, sequence) {
    return filter(x => (x === item), sequence);
}
```
## 解答
* js代码如下:
```javascript
function unique_pairs(n) {
    return flatmap(i => map(j => list(i, j),
                           enumerate_interval(1, i - 1)),
                   enumerate_interval(1, n));
}
function prime_sum_pairs(n) {
    return map(make_pair_sum,
               filter(is_prime_sum,
                      unique_pairs(n)));
}
```
* rust代码如下:
```rust
//依赖代码见习题2.17&习题2.38
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn flatmap<U, F>(&self, fun: F) -> List<U>
    where
        U: Clone + Debug,
        F: Fn(&List<T>) -> List<U>,
    {
        self.map(fun)
            .accumulate(|current, result| result.append(&current), List::Nil)
    }
}
fn enumerate_interval(n: i32) -> List<i32> {
    let mut arr = Vec::new();
    for i in 1..n {
        arr.push(List::V(i));
    }
    List::from_slice(&arr)
}
fn unique_pairs(n: i32) -> List<i32> {
    enumerate_interval(n).flatmap(|i| {
        enumerate_interval(i.value()).map(|j| List::from_slice(&[(*i).clone(), (*j).clone()]))
    })
}
fn main() {
    use List::*;
    println!("{}", unique_pairs(5));
}
// Output
// ((4, (1, Nil)), ((4, (2, Nil)), ((4, (3, Nil)), ((3, (1, Nil)), ((3, (2, Nil)), ((2, (1, Nil)), Nil))))))
```