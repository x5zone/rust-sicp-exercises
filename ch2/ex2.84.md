# 2.5.2 不同类型数据的组合
## 练习2.84
利用练习2.83的raise操作修改apply_generic函数，使它能通过逐层提升的方式把参数强制到同样类型，如本节正文里的讨论。你需要安排一种方式，去检查两个类型中哪个高于另一个。请以一种能与系统中其他部分“相容”​，而且不会影响向塔中加入新层次的方式完成这一工作。

## 解答
为兼容历史习题代码，我们不直接修改`apply_generic`函数的签名（因为许多习题解答和示例代码依赖于当前签名），而是通过模拟实现逐层提升的功能。以下是实现细节：

#### 代码实现
##### `apply_generic`函数

`apply_generic`函数在调用操作之前，检查参数类型是否一致。如果类型不一致，则尝试通过`raise`或`coercion`将参数提升到同一类型。(修改部分参见注释代码)
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
            // 修改代码
            // if get_index(a1) != -1 && get_index(a2) != -1 {
            //     //可提升的算术类型
            //     //欠缺optable参数,修改签名会导致较多历史习题需要修改,暂时不实现
            //     let (a1, a2) = arithmetic_type_raise(a1, a2, optable);

            //     return apply_generic(&op_cloned, &list![a1, a2], get);
            // }

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
```
##### 类型提升逻辑&测试代码
```rust
use std::rc::Rc;

use sicp_rs::ch2::ch2_4::type_tag;
use sicp_rs::ch2::ch2_5::{
    install_arithmetic_raise_package, install_complex_packages, install_javascript_integer_package,
    install_javascript_number_package, install_polar_package, install_rational_package,
    install_rectangular_package, make_complex_from_real_imag, make_javascript_integer,
    make_javascript_number, make_rational, raise,
};
use sicp_rs::ch3::ch3_3::make_table_2d;
use sicp_rs::prelude::*;

const ARITHMETIC_TYPES: [&str; 4] = ["integer", "rational", "javascript_number", "complex"];

fn find_index(type_tag: &str) -> i32 {
    for (i, t) in ARITHMETIC_TYPES.iter().enumerate() {
        if type_tag == *t {
            return i as i32;
        }
    }
    -1
}

fn arithmetic_type_raise(
    a1: List,
    a2: List,
    optable: Rc<dyn Fn(&str) -> ClosureWrapper>,
) -> (List, List) {
    let a1_type_tag = type_tag(&a1);
    let a2_type_tag = type_tag(&a2);
    let a1_index = find_index(&a1_type_tag.to_string());
    let a2_index = find_index(&a2_type_tag.to_string());
    let get = move |args: List| optable("lookup").call(&args);
    fn raise_helper(
        x: &List,
        index_diff: i32,
        get: impl Fn(List) -> Option<List> + 'static + Clone,
    ) -> List {
        if index_diff <= 0 {
            x.clone()
        } else {
            raise_helper(&raise(x, get.clone()), index_diff - 1, get)
        }
    }
    let a1 = if a1_index < a2_index {
        raise_helper(&a1, a2_index - a1_index, get.clone())
    } else {
        a1
    };
    let a2 = if a1_index > a2_index {
        raise_helper(&a2, a1_index - a2_index, get.clone())
    } else {
        a2
    };
    (a1, a2)
}
fn main() {
    let optable = make_table_2d();
    let op_cloned = optable.clone();
    let get = move |args: List| op_cloned("lookup").call(&args);
    let op_cloned = optable.clone();
    let put = move |args: List| op_cloned("insert").call(&args);
    let op_cloned = optable.clone();
    install_complex_packages(op_cloned);
    install_rectangular_package(put.clone());
    install_polar_package(put.clone());
    install_rational_package(put.clone());
    install_javascript_number_package(put.clone());
    install_javascript_integer_package(put.clone());
    install_arithmetic_raise_package(optable.clone());
    // 定义测试数据
    let int1 = make_javascript_integer(5.to_listv(), get.clone());
    let rat1 = make_rational(3.to_listv(), 4.to_listv(), get.clone());
    let js_num1 = make_javascript_number(2.5.to_listv(), get.clone());
    let complex1 = make_complex_from_real_imag(1.0.to_listv(), 2.0.to_listv(), get.clone());

    // 测试类型提升
    let (raised_int, raised_rat) =
        arithmetic_type_raise(int1.clone(), rat1.clone(), optable.clone());
    println!("Raised int: {}, Raised rat: {}", raised_int, raised_rat);

    let (raised_rat, raised_js_num) =
        arithmetic_type_raise(rat1.clone(), js_num1.clone(), optable.clone());
    println!(
        "Raised rat: {}, Raised js_num: {}",
        raised_rat, raised_js_num
    );

    let (raised_js_num, raised_complex) =
        arithmetic_type_raise(js_num1.clone(), complex1.clone(), optable.clone());
    println!(
        "Raised js_num: {}, Raised complex: {}",
        raised_js_num, raised_complex
    );
}
```
#### 输出结果
```rust
Raised int: (rational, (5, 1)), Raised rat: (rational, (3, 4))
Raised rat: 0.75, Raised js_num: 2.5
Raised js_num: (complex, (rectangular, (2.5, 0.0))), Raised complex: (complex, (rectangular, (1.0, 2.0)))
```