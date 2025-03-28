# 2.5.3 实例：符号代数
## 练习2.97
a.请将上述算法实现为一个函数reduce_terms，它以两个项表n和d为参数，返回一个包含nn和dd的表，它们分别是由n和d通过上面说明的算法简化得到的最简形式。再请另写一个与add_poly类似的函数reduce_poly，它检查两个多项式的变元是否相同。如果是，reduce_poly就剥去变元，并把问题交给reduce_terms，最后为reduce_terms返回的表里的两个项表重新加上变元。
b.请定义一个类似reduce_terms的函数，它的功能就像make_rat对整数做的事情：
```javascript
function reduce_integers(n, d) {
    const g = gcd(n, d);
    return list(n / g, d / g);
}
```
并把reduce定义为一个通用型操作，它调用apply_generic完成分派到reduce_poly（对polynomial参数）或reduce_integers（对javascript_number参数）的工作。现在你很容易让有理数算术包把分式简化到最简形式，为此只需让make_rat在组合给定的分子和分母构造出有理数之前也调用reduce。现在这个系统就能处理整数或多项式的有理表达式了。为了测试你的程序，请先试验下面的扩充练习：
```javascript
const p1 = make_polynomial("x", list(make_term(1, 1), make_term(0, 1)));
const p2 = make_polynomial("x", list(make_term(3, 1), make_term(0, -1)));
const p3 = make_polynomial("x", list(make_term(1, 1)));
const p4 = make_polynomial("x", list(make_term(2, 1), make_term(0, -1)));

const rf1 = make_rational(p1, p2);
const rf2 = make_rational(p3, p4);

add(rf1, rf2);
```
看看能否得到正确结果，结果是否被正确地化简为最简形式。