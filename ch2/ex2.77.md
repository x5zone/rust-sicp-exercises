# 2.5.1 通用型算术运算
## 练习2.77
Louis Reasoner试着求值magnitude(z)，其中z是图2.24里的那个对象。令他吃惊的是，apply_generic得到的不是5而是一个错误信息，说没办法对类型("complex")做操作magnitude。他把这次交互的情况拿给AlyssaP.Hacker看，Alyssa说“问题出在没有为"complex"数定义复数的选择函数，而是只为"polar"和"rectangular"数定义了它们。你需要做的就是在complex 包里加入下面这些东西”​：
```javascript
put('real-part', list("complex"), real-part);
put('imag-part', list("complex"), imag-part);
put('magnitude', list("complex"), magnitude);
put('angle', list("complex"), angle);
```
请详细说明为什么这样做可行。作为例子，请考虑表达式magnitude(z)的求值过程，其中z就是图2.24展示的那个对象。请追踪这个求值过程中的所有函数调用，特别地，请看看apply_generic被调用了几次？每次调用分派到哪个函数？