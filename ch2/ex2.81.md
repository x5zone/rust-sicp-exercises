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
2. 我的实现：
    * 在我的实现中，为避免使用全局变量，`get_coercion`会将强制函数包装在`op`中，每次进入`apply_generic`时会尝试解出`coercion`和`op`。
    * 由于强制函数只会被调用一次，第二次调用时`op`中已经没有强制函数，因此不会陷入无限递归。
    * 如果表格中没有对应的操作函数，会直接报错，提示找不到操作。
因此，在我的实现中，对两个复数调用 exp 时，不会出现无限递归，而是直接报错。
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
##### lib code
```rust
pub fn apply_generic(
    op: &List,
    args: &List,
    get: impl Fn(List) -> Option<List> + 'static,
) -> Option<List> {
    let args = if args.head().is_pair() && args.head().head().is_pair() {
        // 处理可能由于apply_generic导致的嵌套列表
        args.flatmap(|x| x.clone())
    } else {
        args.clone()
    };
    // 为兼容历史代码与习题，不改变函数签名的同时，支持coercion
    // op 结构为 pair![list!["coercion", coercion], op]
    let (op, coercion) =
        if op.is_pair() && op.head().is_pair() && op.head().head() == "coercion".to_listv() {
            
            (op.tail(), op.head().tail().head())
        } else {
            (op.clone(), List::Nil)
        };
    let op_cloned = op.clone();
    let type_tags = args.map(|x| type_tag(x));
    let type_tags_cloned = type_tags.clone();
    let op = get(list![op.clone(), type_tags]);
    if let Some(op) = op {
        if let Ok(op) = op.try_as_basis_value::<ClosureWrapper>() {
            return op.call(&args.map(|x| contents(x)));
        } else {
            None
        }
    } else {
        if args.length() == 2 {
            let type1 = type_tags_cloned.head();
            let type2 = type_tags_cloned.tail().head();
            if type1 == type2 {
                panic!("No method for these types op:{}, args:{}", op_cloned, args);
            }
            let a1 = args.head();
            let a2 = args.tail().head();
            let t1_to_t2 = get_coercion(&type1, &type2, &coercion);
            let t2_to_t1 = get_coercion(&type2, &type1, &coercion);
            if t1_to_t2.is_some() {
                let t1_to_t2 = t1_to_t2.unwrap();
                let t1_to_t2 = t1_to_t2.try_as_basis_value::<ClosureWrapper>().unwrap();
                let a1 = t1_to_t2.call(&list![a1.clone()]);
                apply_generic(&op_cloned, &list![a1.unwrap(), a2], get)
            } else if t2_to_t1.is_some() {
                let t2_to_t1 = t2_to_t1.unwrap();
                let t2_to_t1 = t2_to_t1.try_as_basis_value::<ClosureWrapper>().unwrap();
                let a2 = t2_to_t1.call(&list![a2.clone()]);
                apply_generic(&op_cloned, &list![a1, a2.unwrap()], get)
            } else {
                panic!("No method for these types op:{}, args:{}", op_cloned, args);
            }
        } else {
            panic!("No method for these types op:{}, args:{}", op_cloned, args);
        }
    }
}
// coercion support
pub fn put_coercion(
    type1: &List,
    type2: &List,
    proc: ClosureWrapper,
    coercion_list: &List,
) -> List {
    if get_coercion(type1, type2, coercion_list).is_none() {
        pair![
            list![type1.clone(), type2.clone(), proc],
            coercion_list.clone()
        ]
    } else {
        coercion_list.clone()
    }
}
pub fn get_coercion(type1: &List, type2: &List, coercion_list: &List) -> Option<List> {
    fn get_type1(list_item: &List) -> List {
        list_item.head()
    }
    fn get_type2(list_item: &List) -> List {
        list_item.tail().head()
    }
    fn get_proc(list_item: &List) -> List {
        list_item.tail().tail().head()
    }
    fn get_coercion_iter(type1: &List, type2: &List, items: &List) -> Option<List> {
        if items.is_empty() {
            None
        } else {
            let top = items.head();

            if get_type1(&top) == *type1 && get_type2(&top) == *type2 {
                Some(get_proc(&top))
            } else {
                get_coercion_iter(type1, type2, &items.tail())
            }
        }
    }
    get_coercion_iter(type1, type2, coercion_list)
}
```
##### main code
```rust
use sicp_rs::ch2::ch2_4::apply_generic;
use sicp_rs::ch2::ch2_5::add;
use sicp_rs::ch2::ch2_5::install_complex_packages;
use sicp_rs::ch2::ch2_5::install_javascript_number_package;
use sicp_rs::ch2::ch2_5::install_polar_package;
use sicp_rs::ch2::ch2_5::install_rectangular_package;
use sicp_rs::ch2::ch2_5::make_complex_from_real_imag;
use sicp_rs::ch2::ch2_5::make_javascript_number;
use sicp_rs::ch2::ch2_5::put_coercion;
use sicp_rs::ch3::ch3_3::make_table_2d;
use sicp_rs::prelude::*;

fn exp(x: &List, y: &List, get: impl Fn(List) -> Option<List> + 'static, coercion: &List) -> List {
    if coercion.is_empty() {
        apply_generic(&"exp".to_listv(), &list![x.clone(), y.clone()], get).unwrap()
    } else {
        apply_generic(
            &pair![list!["coercion", coercion.clone()], "exp"],
            &list![x.clone(), y.clone()],
            get,
        )
        .unwrap()
    }
}
fn main() {
    // 创建操作符表
    let optable = make_table_2d();
    let op_cloned = optable.clone();
    let get = move |args: List| op_cloned("lookup").call(&args);
    let op_cloned = optable.clone();
    let put = move |args: List| op_cloned("insert").call(&args);
    let op_cloned = optable.clone();
    install_complex_packages(op_cloned);
    install_rectangular_package(put.clone());
    install_polar_package(put.clone());
    install_javascript_number_package(put.clone());

    let get_cloned = get.clone();
    let javascript_number_to_complex = ClosureWrapper::new(move |args: &List| {
        let args = args.head();
       
        let x = *(args.try_as_basis_value::<f64>().unwrap());
        Some(make_complex_from_real_imag(
            x.to_listv(),
            0.0.to_listv(),
            get_cloned.clone(),
        ))
    });
    let coercion = put_coercion(
        &"javascript_number".to_listv(),
        &"complex".to_listv(),
        javascript_number_to_complex,
        &List::Nil,
    );
    // 测试不同类型的加法
    let c = make_complex_from_real_imag(4.0.to_listv(), 3.0.to_listv(), get.clone());
    let n = make_javascript_number(7.0.to_listv(), get.clone());
    let get_cloned = get.clone();
    println!(
        "{}, {}, add {}",
        c,
        n,
        add(&c, &n, get_cloned.clone(), &coercion)
    );
    let complex_to_complex = ClosureWrapper::new(move |args: &List| {
        let args = args.head();
        
        Some(args)
    });
    let coercion = put_coercion(
        &"complex".to_listv(),
        &"complex".to_listv(),
        complex_to_complex,
        &coercion,
    );
    // 测试exp
    put(list![
        "exp",
        list!["javascript_number", "javascript_number"],
        ClosureWrapper::new(move |args: &List| {
            let (base, exp) = (args.head(), args.tail().head());
            let base = base.try_as_basis_value::<f64>().unwrap();
            let exp = exp.try_as_basis_value::<f64>().unwrap();
            Some(make_javascript_number(
                (base.powf(*exp)).to_listv(),
                get_cloned.clone(),
            ))
        })
    ]);
    println!(
        "{}",
        exp(&10.0.to_listv(), &2.0.to_listv(), get.clone(), &coercion)
    );
    // complex exp will panic
    // println!("{}", exp(&c, &c, get.clone(), &coercion));
}
```
