# 1.2.6 实例：素数检测
## 练习1.26
Louis Reasoner在做练习1.24时遇到很大困难，他的fast_is_prime检查看起来运行得比他写的is_prime还慢。Louis请他的朋友Eva Lu Ator过来帮忙。在检查Louis的代码时，两人发现他重写了expmod函数，其中采用显式的乘法而没有调用square：
```javascript
function expmod_original(base,exp,m) {
    return exp === 0
        ? 1
        : is_even(exp)
        ? (expmod(base, exp/2, m)*expmod(base, exp/2, m)) % m
        : (base * expmod(base, exp-1, m)) % m;
}
```
“我看不出来这会造成什么不同，​”Louis说。​“我能看出，​”Eva说，​“用这种方式写这个函数，你就把一个Θ(log n)的计算过程变成Θ(n)的了。​”请解释这个问题。

## 解答
* 使用square时，递归过程中问题规模是每次减小一倍，时间复杂度Θ(log n)。
* 而更改为`(expmod(base, exp/2, m)*expmod(base, exp/2, m))`后，相当于$(exp/2)*(exp/2)=exp$，重复调用一次，抵消了问题规模减少这一倍，所以时间复杂度变为了Θ(n)。
