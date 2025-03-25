# 2.5.2 不同类型数据的组合
## 练习2.84
利用练习2.83的raise操作修改apply_generic函数，使它能通过逐层提升的方式把参数强制到同样类型，如本节正文里的讨论。你需要安排一种方式，去检查两个类型中哪个高于另一个。请以一种能与系统中其他部分“相容”​，而且不会影响向塔中加入新层次的方式完成这一工作。

## 解答

#### 代码输出
```rust
5 and (rational, (3, 4)) uniform to ((rational, (5, 1)), (rational, (3, 4)))
5 + (rational, (3, 4)) = (rational, (23, 4))
(rational, (3, 4)) and 2.5 uniform to (0.75, 2.5)
(rational, (3, 4)) + 2.5 = 3.25
2.5 and (complex, (rectangular, (1.0, 2.0))) uniform to ((complex, (rectangular, (2.5, 0.0))), (complex, (rectangular, (1.0, 2.0))))
2.5 + (complex, (rectangular, (1.0, 2.0))) = (complex, (rectangular, (3.5, 2.0)))
```

#### 代码实现
##### `apply_generic`函数

`apply_generic`函数在调用操作之前，检查参数类型是否一致。如果类型不一致，则尝试通过`raise`或`coercion`将参数提升到同一类型。(修改部分参见注释)
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
        // 找到对应函数签名，直接调用
        func.call(&args.map(|x| contents(x)))
    } else {
        if args.length() != 2 {
            panic!("apply_generic expects 2 args, got {} with op {}", args, op);
        }

        let type1 = type_tags.head();
        let type2 = type_tags.tail().head();
        assert_ne!(type1, type2, "no method found for op:{}, args:{}", op, args);
        let a1 = args.head();
        let a2 = args.tail().head();

        //可提升的算术类型
        if find_arithmetic_type_index(&type1.to_string()) != -1             //新增行
            && find_arithmetic_type_index(&type2.to_string()) != -1         //新增行
        {
            let (a1, a2) = unify_arithmetic_types(a1, a2, arith);           //新增行
            return apply_generic(op, &list![a1, a2], arith);                //新增行
        }

        // 类型强制
        let try_coerce_and_apply = |t1: &List, t2: &List, a1: &List, a2: &List, direction: i32| {
            if let Some(t1_to_t2) = arith.get_coercion(t1, t2) {
                let coerce = |x:&List| {
                    t1_to_t2
                        .call(&list![x.clone()])
                        .expect(&format!("{} to {} coercion failed", t1, t2))
                };
                let (a1,a2) = match direction {
                    1 => (coerce(a1), a2.clone()),
                    2 => (a1.clone(), coerce(a2)),
                    _ => unreachable!("coerce direction only support 1:t1_to_t2 and 2:t2_to_t1")
                };
                apply_generic(op, &list![a1, a2], arith)
            } else {
                None
            }
        };
        if let Some(result) = try_coerce_and_apply(&type1, &type2, &a1, &a2, 1)
            .or_else(|| try_coerce_and_apply(&type2, &type1, &a1, &a2, 2))
        {
            Some(result)
        } else {
            panic!("No method for these types op:{}, args:{}", op, args);
        }
    }
}
```
##### main函数
```rust
use sicp_rs::ch2::ch2_5::{
    ArithmeticContext, install_arithmetic_package, make_complex_from_real_imag, make_float,
    make_integer, make_rational, unify_arithmetic_types,
};

use sicp_rs::prelude::*;

fn main() {
    // 创建通用算术包上下文
    let arith = ArithmeticContext::new();
    install_arithmetic_package(&arith);
    // 定义测试数据
    let int1 = make_integer(5, &arith);
    let rat1 = make_rational(3.to_listv(), 4.to_listv(), &arith);
    let float1 = make_float(2.5, &arith);
    let complex1 = make_complex_from_real_imag(1.0.to_listv(), 2.0.to_listv(), &arith);

    // 测试类型提升
    let (raised_int, raised_rat) = unify_arithmetic_types(int1.clone(), rat1.clone(), &arith);
    println!(
        "{} and {} uniform to ({}, {})",
        int1, rat1, raised_int, raised_rat
    );
    println!("{} + {} = {}", int1, rat1, arith.add(&int1, &rat1));

    let (raised_rat, raised_float) = unify_arithmetic_types(rat1.clone(), float1.clone(), &arith);
    println!(
        "{} and {} uniform to ({}, {})",
        rat1, float1, raised_rat, raised_float
    );
    println!("{} + {} = {}", rat1, float1, arith.add(&rat1, &float1));

    let (raised_float, raised_complex) =
        unify_arithmetic_types(float1.clone(), complex1.clone(), &arith);
    println!(
        "{} and {} uniform to ({}, {})",
        float1, complex1, raised_float, raised_complex
    );
    println!(
        "{} + {} = {}",
        float1,
        complex1,
        arith.add(&float1, &complex1)
    );
}
```
##### 依赖lib代码
```rust
const ARITHMETIC_TYPES: [&str; 4] = ["integer", "rational", "float", "complex"];

pub fn find_arithmetic_type_index(type_tag: &str) -> i32 {
    for (i, t) in ARITHMETIC_TYPES.iter().enumerate() {
        if type_tag == *t {
            return i as i32;
        }
    }
    -1
}
pub fn is_basis_arithmetic_type(x: &List) -> bool {
    find_arithmetic_type_index(&type_tag(x).to_string()) >= 0
}
// 将两个值的类型提升到统一的类型。
pub fn unify_arithmetic_types(a1: List, a2: List, arith: &ArithmeticContext) -> (List, List) {
    let a1_index = find_arithmetic_type_index(&type_tag(&a1).to_string());
    let a2_index = find_arithmetic_type_index(&type_tag(&a2).to_string());
    fn type_raise(x: &List, index_diff: i32, arith: &ArithmeticContext) -> List {
        if index_diff <= 0 {
            x.clone()
        } else {
            type_raise(&arith.raise(x), index_diff - 1, arith)
        }
    }
    let a1 = if a1_index < a2_index {
        type_raise(&a1, a2_index - a1_index, arith)
    } else {
        a1
    };
    let a2 = if a1_index > a2_index {
        type_raise(&a2, a1_index - a2_index, arith)
    } else {
        a2
    };
    (a1, a2)
}
```