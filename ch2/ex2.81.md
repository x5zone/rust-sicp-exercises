# 2.5.2 不同类型数据的组合
## 练习2.81
Louis Reasoner注意到，即使两个参数已经具有同样类型，apply_generic也可能试着把一个参数强制到另一参数的类型。由此他推论说，需要在强制表格中加一些函数，把每个类型的参数“强制”到它们自己的类型。例如，除了上面给的javascript_number_to_complex强制外，他觉得还应该有：
```javascript
function javascript_number_to_javascript_number(n) { return n; }
function complex_to_complex(z) { return z; }
put_coercion("javascript_number", "javascript_number", javascript_number_to_javascript_number);
put_coercion("complex", "complex", complex_to_complex);
```
a.假设安装了Louis的强制函数，如果在调用apply_generic时两个参数的类型都是"javascript_number"，或者两个参数的类型都是"complex"，而表格里又找不到针对这些类型的操作，会出现什么情况？例如，假定我们定义了一个通用型求幂运算：
```javascript
function exp(x, y) {
    return apply_generic("exp", list(x, y))
}
```
并在JavaScript-数值包里放了一个求幂函数，但其他程序包里都没有：
```javascript
// following added to JavaScript-number package
put("exp", list("javascript_number", "javascript_number"), (x, y) => tag(math_exp(x, y))); // using primitive math_exp
```
如果对两个复数调用exp会出现什么情况？
b.Louis说的对吗？也就是问：对同类型参数的强制问题，我们必须要做些工作吗？或者，现在的apply_generic就已经能正确工作了吗？
c.请修改apply_generic，使之不会试着去强制两个同类型的参数。

## 解答
#### a. 如果安装了 Louis 的强制函数，会发生什么？
假设调用`apply_generic`时，两个参数类型相同，但表格中找不到对应的操作函数：
1. Louis 的实现问题：
    * 如果参数类型是相同的，例如`["complex", "complex"]`，Louis 的强制函数（如`complex_to_complex`）会被调用。
    * 由于强制函数只是返回参数本身，这会导致参数类型没有变化，仍然是`["complex", "complex"]`。
    * 结果是`apply_generic`再次进入强制分支，导致**无限递归**。
#### b. Louis 的推论是否正确？
Louis 的推论 不完全正确。原因如下：
1. 正确的部分：
    * 如果同类型参数掉入`else`分支，确实会尝试对同类型参数进行强制转换。
2. 错误的部分：
    * 不需要像 Louis 那样实现同类型的强制函数（如`complex_to_complex`）。如果没有定义同类型的强制函数，`apply_generic`会因为找不到强制转换函数而直接报错退出，这符合预期。
所以，Louis 的推论是多余的，添加同类型的强制函数并没有意义。
#### 修改`apply_generic`，避免对同类型参数强制
虽然不修改`apply_generic`也可以（因为找不到强制转换函数会直接报错），但为了让报错更清晰，可以新增代码判断两个参数类型是否相同。如果相同，就直接报错，提示没有该类型对应的操作函数。

#### Rust代码

##### main code
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, apply_generic, install_complex_package, install_float_package,
        install_integer_package, install_polar_package, install_rational_package,
        install_rectangular_package, make_complex_from_real_imag, make_float,
    },
    prelude::*,
};

fn exp(x: &List, y: &List, arith: &ArithmeticContext) -> List {
    apply_generic(&"exp".to_listv(), &list![x.clone(), y.clone()], &arith).unwrap()
}
fn main() {
    // 创建通用算术包上下文
    let mut arith = ArithmeticContext::new();
    install_integer_package(&arith);
    install_float_package(&arith);
    install_rational_package(&arith);
    install_polar_package(&arith);
    install_rectangular_package(&arith);
    install_complex_package(&arith);

    let float_to_complex_rectangular = ClosureWrapper::new({
        let arith = arith.clone();
        move |args: &List| {
            let real = args.head();
            Some(make_complex_from_real_imag(real, 0.0.to_listv(), &arith))
        }
    });

    arith.put_coercion(
        &"float".to_listv(),
        &"complex".to_listv(),
        float_to_complex_rectangular,
    );
    let c = make_complex_from_real_imag(4.0.to_listv(), 3.0.to_listv(), &arith);
    let n = make_float(7.0, &arith);
    println!("{} + {} = {}", c, n, arith.add(&c, &n));

    let complex_to_complex = ClosureWrapper::new(move |args: &List| Some(args.head()));
    arith.put_coercion(
        &"complex".to_listv(),
        &"complex".to_listv(),
        complex_to_complex,
    );
    arith.put(
        &"exp",
        list!["float", "float"],
        ClosureWrapper::new({
            let arith = arith.clone();
            move |args: &List| {
                let (base, exp) = (args.head(), args.tail().head());
                if base.is_float_value() && exp.is_float_value() {
                    let base = base.try_as_basis_value::<f64>().unwrap();
                    let exp = exp.try_as_basis_value::<f64>().unwrap();
                    Some(make_float(base.powf(*exp), &arith))
                } else {
                    panic!("Now only support f64")
                }
            }
        }),
    );

    println!("{}", exp(&10.0.to_listv(), &2.0.to_listv(), &arith));
    // panic: ArithmeticContext get failed! No func found for keys:(exp, ((complex, (complex, Nil)), Nil))
    // println!("{}", exp(&c, &c, &arith));
}
// Output
// (complex, (rectangular, (4.0, 3.0))) + 7.0 = (complex, (rectangular, (11.0, 3.0)))
// 100.0
```
##### lib code
```rust
pub fn apply_generic(op: &List, args: &List, arith: &ArithmeticContext) -> Option<List> {
    let args = if args.head().is_pair() && args.head().head().is_pair() {
        // 处理可能由于apply_generic导致的嵌套列表
        args.flatmap(|x| x.clone())
    } else {
        args.clone()
    };

    let type_tags = args.map(|x| type_tag(x));
    let func = arith.get(list![op.clone(), type_tags.clone()]);
    if let Some(func) = func {
        func.call(&args.map(|x| contents(x)))
    } else {
        if args.length() == 2 {
            let type1 = type_tags.head();
            let type2 = type_tags.tail().head();
            if type1 == type2 {   // complex to complex panic here
                panic!("No method for these types op:{}, args:{}", op, args);
            }
            let a1 = args.head();
            let a2 = args.tail().head();

            let t1_to_t2 = arith.get_coercion(&type1, &type2);
            let t2_to_t1 = arith.get_coercion(&type2, &type1);
            if t1_to_t2.is_some() {
                let t1_to_t2 = t1_to_t2.unwrap();
                let a1 = t1_to_t2
                    .call(&list![a1.clone()])
                    .expect(&format!("{} to {} coercion failed", type1, type2));
                apply_generic(op, &list![a1, a2], arith)
            } else if t2_to_t1.is_some() {
                let t2_to_t1 = t2_to_t1.unwrap();
                let a2 = t2_to_t1
                    .call(&list![a2.clone()])
                    .expect(&format!("{} to {} coercion failed", type2, type1));
                apply_generic(&op, &list![a1, a2], arith)
            } else {
                panic!("No method for these types op:{}, args:{}", op, args);
            }
        } else {
            panic!("No method for these types op:{}, args:{}", op, args);
        }
    }
}
impl ArithmeticContext {

    // coercion support
    pub fn put_coercion(
        &mut self,
        type1: &List,
        type2: &List,
        proc: ClosureWrapper,
    ) -> Option<List> {
        if self.get_coercion(type1, type2).is_none() {
            self.coercion = pair![
                list![type1.clone(), type2.clone(), proc],
                self.coercion.clone()
            ]
        }
        Some("done".to_listv())
    }
    pub fn get_coercion(&self, type1: &List, type2: &List) -> Option<ClosureWrapper> {
        fn get_type1(list_item: &List) -> List {
            list_item.head()
        }
        fn get_type2(list_item: &List) -> List {
            list_item.tail().head()
        }
        fn get_proc(list_item: &List) -> List {
            list_item.tail().tail().head()
        }
        fn get_coercion_iter(type1: &List, type2: &List, items: &List) -> Option<ClosureWrapper> {
            if items.is_empty() {
                None
            } else {
                let top = items.head();

                if get_type1(&top) == *type1 && get_type2(&top) == *type2 {
                    if let Ok(proc) = get_proc(&top).try_as_basis_value::<ClosureWrapper>() {
                        Some(proc.clone())
                    } else {
                        eprintln!(
                            "get_coercion_iter failed! try_into_Closure failed for keys:{}",
                            top
                        );
                        None
                    }
                    //Some(get_proc(&top))
                } else {
                    get_coercion_iter(type1, type2, &items.tail())
                }
            }
        }
        get_coercion_iter(type1, type2, &self.coercion)
    }
}
```
