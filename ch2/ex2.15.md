# 2.1.4 扩展练习：区间算术
## 练习2.15
另一用户Eva Lu Ator也注意到了根据等价的不同代数表达式算出的区间的差异。她说，如果把公式写成一种形式，其中表示具有非精确值的名字不重复出现，那么Alyssa的系统产生出的区间的界限会更紧一些。她还说，正因为此，在计算并联电阻时，par2是比par1“更好的”程序。她说得对吗？
```javascript
function par1(r1,r2) {
    return div_interval(mul_interval(r1,r2),
                        add_interval(r1,r2))
}
function par2(r1,r2) {
    const one = make_interval(1,1);
    return div_interval(one,
                        add_interval(div_interval(one,r1),
                                     div_interval(one,r2)));
}
```

## 解答
* 可代入实际值来看一看具体的误差传播过程。
* 设我们的r1,r2均为[center:100,percent:0.01]
* 首先计算各种运算的误差传播:
    * 乘法误差传播为: [center:10001,percent:0.02]，误差变为原来的2倍。
    * 加法误差传播为: [center:200,percent:0.01]
    * 除法误差传播为: [center:1.00,percent:0.02]，其实对比就可知，除法必然和乘法的误差传播系数是一致的，求倒数是常量区间除以被除数，求倒数不会增加误差。
* 对比par1和par2:
    * par1一次乘法和一次除法，两次2倍的误差传播，加法不增加误差。
    * par2一次加法不增加误差，3次求倒数，也不会增加误差。
    * 由于 par2 的实现方式减少了乘法和除法的次数，误差传播被限制在最低范围内。
* 综上，par2是比par1更好的计算方式。