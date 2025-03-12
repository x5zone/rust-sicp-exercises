# 2.2.1 序列的表示
## 练习2.19
现在重新考虑1.2.2节的兑换零钱方式的计数程序。如果很容易改变程序里用的兑换币种，那当然就更好了。譬如说，我们就也能计算一英镑的不同兑换方式数。在写前面的程序时，有关币种的知识散布在不同地方：一部分出现在函数first_denomination里，另一部分出现在函数count_change里（它知道有5种美元硬币）​。如果我们能用一个表来提供可用于兑换的硬币，那就更好了。
我们希望重写函数cc，令其第二个参数是一个可用硬币的币值表，而不是一个表示可用硬币种类的整数。然后我们就可以针对每种货币定义一个表：
```javascript
const us_coins = list(50,25,10,5,1);
const uk_coins = list(100,50,20,10,5,2,1);
```
这样，我们就可以用如下的方式调用cc：
```javascript
cc(100, us_coins);
292
```
为了做到这些，我们需要对程序cc做一些修改。它仍然具有同样的形式，但将以不同的方式访问自己的第二个参数，如下面所示：
```javascript
function cc(amount, coin_values) {
    return amount === 0
        ? 1
        : amount < 0 || no_more(coin_values)
        ? 0
        : cc(amount, except_first_denomination(coin_values))
          + cc(amount - first_denomination(coin_values), coin_values);
}
```
请基于表结构的基本操作声明函数first_denomination、except_first_denomination和no_more。表coin_values的排列顺序会影响cc给出的回答吗？为什么会或不会？

## 解答
* 不会影响cc给出的回答。改变排列顺序只会影响遍历树的顺序，但树仍会全部搜索遍历到。
    * 习题1.14也是换零钱的方式计数习题。
* 声明函数参见rust代码，如下:
```rust
//相关代码参见习题2.17
fn no_more<T>(l: &List<T>) -> bool {
    match l {
        List::Nil => true,
        _ => false,
    }
}
fn first_denomination<T: Clone + Debug>(l: &List<T>) -> T {
    l.head().value()
}
fn except_first_denomination<T: Clone + Debug>(l: &List<T>) -> &List<T> {
    l.tail()
}
fn cc(amount: i32, coin_values: &List<i32>) -> i32 {
    if 0 == amount {
        1
    } else if amount < 0 || no_more(coin_values) {
        0
    } else {
        cc(amount, except_first_denomination(coin_values))
            + cc(amount - first_denomination(coin_values), coin_values)
    }
}
fn main() {
    use List::{Cons, Nil, V};
    let us_coins = List::from_slice(&[V(50), V(25), V(10), V(5), V(1)]);
    let uk_coins = List::from_slice(&[V(100), V(50), V(20), V(10), V(5), V(2), V(1)]);
    println!("{}", cc(100, &us_coins));
    println!("{}", cc(100, &us_coins.reverse()));
}
// Output:
// 292
// 292
```