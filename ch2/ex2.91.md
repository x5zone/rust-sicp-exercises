# 2.5.3 实例：符号代数
## 练习2.91
一个单变元多项式可以除以另一个多项式，产生一个商式和一个余式。例如：
$$\frac{x^5 - 1}{x^2 - 1} = x^3 + x, \text{余式} x - 1$$
除法可以通过长除完成，也就是说，用被除式的最高次项除以除式的最高次项，得到商式的第一项；然后用这个结果乘以除式，再从被除式中减去这个乘积。剩下的工作就是用减得到的差作为新的被除式，重复上述做法，产生随后的结果。当除式的次数超过被除式的次数时结束，此时的被除式就是余式。还有，如果被除式是0，就返回0作为商和余式。
我们可以基于add_poly和mul_poly的模型，设计一个除法函数div_poly。这个函数先检查两个多项式的未定元是否相同，如果相同就剥去变元，把问题送给函数div_terms，由它执行项表上的除法运算。div_poly最后把变元重新附加到div_terms返回的结果上。把div_terms设计为同时计算除法的商式和余式可能更方便。div_terms可以以两个项表为参数，返回包含一个商式项表和一个余式项表的表。请填充下面函数div_terms中空缺的部分，完成这个定义，并基于它实现div_poly。该函数应该以两个多项式为参数，返回一个包含商和余式多项式的表。
```javascript
function div_terms(L1, L2) {
    if (is_empty_termlist(L1)) {
        return list(the_empty_termlist, the_empty_termlist);
    } else {
        const t1 = first_term(L1);
        const t2 = first_term(L2);
        if (order(t2) > order(t1)) {
            return list(the_empty_termlist, L1);
        } else {
            const new_c = div(coeff(t1), coeff(t2));
            const new_o = order(t1) - order(t2);
            const rest_of_result = ⟨⟨compute rest of result recursively⟩⟩;
            ⟨⟨form and return complete result⟩⟩
        }
    }
}
```
