# 2.5.3 实例：符号代数
## 练习2.97
至此，我们已经弄清楚了如何把一个有理函数化简到最简形式：
* 用取自练习2.96的gcd_terms版本计算分子和分母的GCD；
* 在得到了GCD之后，用它去除分子和分母之前，先把分子和分母都乘以同一个整数化因子，使得除以这个GCD不会引进非整数的系数。作为整数化因子，你可以用得到的GCD的首项系数的1+O1-O2次幂。其中O2是这个GCD的次数，O1是分子与分母中的次数较大的那个。这样就能保证用这个GCD去除分子和分母时不会引进非整数。
* 这一操作得到的结果分子和分母都具有整数的系数。这些系数通常会由于整数化因子而变得非常大。所以最后一步就是消去这个多余的因子，为此，我们需要先算出分子和分母中所有系数的（整数）最大公约数，而后除去这个公约数。

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