# 2.5.2 不同类型数据的组合
## 练习2.82
请阐述如何推广apply_generic，以便处理多个参数的一般性强制问题。一种可能策略是首先试着把所有参数都强制到第一个参数的类型，然后试着强制到第二个参数的类型，并这样试下去。请给一个例子说明这种策略还不够一般（就像上面有关两个参数的情况的例子）​。​（提示：请考虑一些情况，其中表格里某些合适的操作将不会被考虑。​）

## 解答
#### 问题分析
为了让`apply_generic`支持多个参数的类型强制，需要解决以下问题：
* 多参数强制：不仅仅是两个参数，而是任意数量的参数。
* 类型转换的多样性：可能存在复杂的类型转换路径，例如`type1 -> type2 -> type3`。
* 函数签名匹配：需要找到一个函数签名，使得经过类型强制后，所有参数的类型都匹配。
* 转换成本：在可能的情况下，选择转换成本最低的方案。

然而，简单地将所有参数强制到第一个参数的类型（或其他某个固定类型）并不够通用。例如：
* 如果函数签名是`(type1, type5, type3)`，而参数类型是`(type1, type2, type1)`，将所有参数强制为`type1`或`type2`都无法匹配函数签名。
* 如果存在混合类型的函数签名（如`(typeA, typeB, typeB)`），逐一强制到某个参数的类型可能会错过有效的函数。
* 如果函数签名是`(type4, type4)`，而参数类型是`(type1, type2)`，此时需要将所有参数强制到`type4`。

#### 算法设计
设想存在这样一个函数和相应的参数：
```
fn somefunc(arg1 :type_1, arg2: type_2, ..., argn: type_n) {}
该函数还接受:       type_a,       type_b,            type_z
                  type_c,       type_d,            type_y

同时对于类型  type_1, type_2...有如下的类型转换：
            type_a, type_b...
            type_d, type_x
```
我们可以设计如下算法来实现：
1. 获取`somefunc`的所有函数签名
    * 对于某种类型而言，可转换的目标类型通常较少；而对于某个泛型函数（例如`add`），满足其泛型约束的类型可能非常多。
    * 更合适的方法是：
        * 对于`arg1`，获取其所有可转换的类型。
        * 以`arg1`的类型为限制，筛选出`somefunc`的所有函数签名。

2. 遍历所有函数签名，计算输入参数是否可通过转换满足函数签名
    * 对于函数签名`(type_a, type_b, type_c...)`：
        * 深度优先遍历输入参数的所有可转换类型，计算是否匹配函数签名。
        * 同时记录转换路径和转换成本。

3. 选择转换成本最低的方案
    * 转换成本可以通过类型强制的步数来衡量。
    * 在所有匹配的函数签名中，选择转换成本最低的方案。
#### 设计思路的优化与限制

一个非常重要的设计思想是加速经常性事件。对于函数调用过程中的参数类型转换，这是一个典型的经常性事件。
##### 问题 1：性能成本

上述算法的性能成本较高。若每次函数调用都需要一次深度优先遍历来计算类型转换路径，那么性能将非常糟糕。
##### 问题 2：语义偏差

类型转换可能引入语义偏差。例如`add(1, 2+3i)`：
* 我们可以通过类型强制将参数转换为`string`，并匹配`add(string, string)`的函数签名。
* 但原函数的语义为数字相加，而非字符串拼接。

因此，我们需要在设计中尽可能减少语义偏差，并确保类型转换的安全性和一致性。

#### 现代语言的实现
* 现代语言的**自动类型转换**通常有限制，优先考虑安全性和语义一致性。
* 习题中描述的**一般性类型转换**在实际语言中很少实现，因为它带来了语义模糊和性能问题。

#### 输出示例
```rust
min arg tranforms: 6
min arg tranforms: 3
Selected function: A closure wrapped in ClosureWrapper
Transformed args: ((type1, arg1), ((type5, arg2 type2->type3 type3->type5), ((type3, arg3 type1->type3), Nil)))
Function result: complex_func(type1, type5, type3) called with args: ((type1, arg1), ((type5, arg2 type2->type3 type3->type5), ((type3, arg3 type1->type3), Nil)))
```
#### 完整代码
```rust
use sicp_rs::{ch2::ch2_5::ArithmeticContext, prelude::*};
fn test_transform() {
    // 创建函数表格
    let mut arith = ArithmeticContext::new();
    // 定义多个函数签名[(type1,type5,type3),(type3,type4,type5),(type5,type5,type5)]
    {
        arith.put(
            "complex_func",
            list!["type1", "type5", "type3"],
            ClosureWrapper::new(move |args: &List| {
                let result = format!(
                    "complex_func(type1, type5, type3) called with args: {}",
                    args
                );
                Some(result.to_string().to_listv())
            }),
        );

        arith.put(
            "complex_func",
            list!["type3", "type4", "type5"],
            ClosureWrapper::new(move |args: &List| {
                let result = format!(
                    "complex_func(type3, type4, type5) called with args: {}",
                    args
                );
                Some(result.to_string().to_listv())
            }),
        );

        arith.put(
            "complex_func",
            list!["type5", "type5", "type5"],
            ClosureWrapper::new(move |args: &List| {
                let result = format!(
                    "complex_func(type5, type5, type5) called with args: {}",
                    args
                );
                Some(result.to_string().to_listv())
            }),
        );
    }

    // 创建类型强制表格[(type1->type2),(type2->type3),(type1->type4),(type4->type5),(type3->type5),(type1->type5),(type5->type2),(type1->type3)]
    {
        arith.put_coercion(
            &"type1".to_listv(),
            &"type2".to_listv(),
            ClosureWrapper::new(|args: &List| {
                let value = args.head();
                Some(format!("{} type1->type2", value).to_string().to_listv())
            }),
        );

        arith.put_coercion(
            &"type2".to_listv(),
            &"type3".to_listv(),
            ClosureWrapper::new(|args: &List| {
                let value = args.head();
                Some(format!("{} type2->type3", value).to_string().to_listv())
            }),
        );

        arith.put_coercion(
            &"type1".to_listv(),
            &"type4".to_listv(),
            ClosureWrapper::new(|args: &List| {
                let value = args.head();
                Some(format!("{} type1->type4", value).to_string().to_listv())
            }),
        );

        arith.put_coercion(
            &"type4".to_listv(),
            &"type5".to_listv(),
            ClosureWrapper::new(|args: &List| {
                let value = args.head();
                Some(format!("{} type4->type5", value).to_string().to_listv())
            }),
        );

        arith.put_coercion(
            &"type3".to_listv(),
            &"type5".to_listv(),
            ClosureWrapper::new(|args: &List| {
                let value = args.head();
                Some(format!("{} type3->type5", value).to_string().to_listv())
            }),
        );

        arith.put_coercion(
            &"type1".to_listv(),
            &"type5".to_listv(),
            ClosureWrapper::new(|args: &List| {
                let value = args.head();
                Some(format!("{} type1->type5", value).to_string().to_listv())
            }),
        );
        arith.put_coercion(
            &"type5".to_listv(),
            &"type2".to_listv(),
            ClosureWrapper::new(|args: &List| {
                let value = args.head();
                Some(format!("{} type5->type2", value).to_string().to_listv())
            }),
        );
        arith.put_coercion(
            &"type1".to_listv(),
            &"type3".to_listv(),
            ClosureWrapper::new(|args: &List| {
                let value = args.head();
                Some(format!("{} type1->type3", value).to_string().to_listv())
            }),
        );
    }

    // 准备输入参数(type1,type2,type1)
    let input_args = list![
        pair!("arg1".to_listv(), "type1".to_listv()),
        pair!("arg2".to_listv(), "type2".to_listv()),
        pair!("arg3".to_listv(), "type1".to_listv())
    ];

    // 获取函数签名
    let func_name = "complex_func".to_string().to_listv();
    let func_types = get_func_argtypes(&func_name, input_args.length(), &arith);

    // 执行参数转换
    let (transformed_args, selected_func) = transform(&input_args, func_types, &arith);

    // 打印结果
    if let (Some(args), Some(func)) = (transformed_args, selected_func) {
        println!("Selected function: {}", func);
        println!("Transformed args: {}", args);

        // 调用选中的函数
        let func_closure = func.try_as_basis_value::<ClosureWrapper>().unwrap();
        let result = func_closure.call(&args).unwrap();
        println!("Function result: {}", result);
    } else {
        println!("No suitable function found.");
    }
}
// 处理所有函数签名，并返回成本最低的转换结果。
fn transform(
    input_args: &List,
    func_types: List,
    arith: &ArithmeticContext,
) -> (Option<List>, Option<List>) {
    let mut min_cost = i32::MAX;
    let mut best_results = None;
    let mut best_func = None;
    let mut func_types = func_types.clone();
    // func_types: list[pair[list[type1,type2,type3...],some_func],...]
    while func_types.is_empty() == false {
        let fun = func_types.head();

        let func = fun.tail();
        let (cost, flag, results) =
            transform_argtypes(&input_args, fun, &arith.coercion, List::Nil, 0);
        if flag == true && cost < min_cost {
            min_cost = cost;
            println!("min arg tranforms: {}", min_cost);
            best_results = Some(results);
            best_func = Some(func);
        }
        func_types = func_types.tail();
    }
    return (best_results, best_func);
}
// 处理单个函数签名，并返回成本和转换后的参数列表。
fn transform_argtypes(
    input_args: &List,
    func_argtypes: List,
    coercion: &List,
    results: List,
    cost: i32,
) -> (i32, bool, List) {
    // input args: list[pair(arg1,type1),pair(arg2,type2),...]
    // func_types: pair[list[type1,type2,type3...],some_func]
    if input_args.is_empty() {
        // 所有参数都已匹配，则匹配成功。
        return (cost, true, results.clone());
    }

    let type_x = input_args.head().tail();

    // 当前参数是否满足函数的参数类型?
    if type_x == func_argtypes.head().head() {
        // results: list[pair(type1,val1),pair(type2,val2)...].append(list[pair(type_x,val_x)])
        let results = results.append(&list![pair!(type_x, input_args.head().head())]);
        // input_args: list[pair(arg2,type2),...]
        let input_args = input_args.tail();
        // func_types: pair[list[type2,type3...],some_func]
        let func_argtypes = list![func_argtypes.head().tail(), func_argtypes.tail()];
        let (cost, flag, results) =
            transform_argtypes(&input_args, func_argtypes, &coercion, results, cost);
        return (cost, flag, results.clone());
    } else {
        // 当前参数不匹配，尝试转换参数类型，可能需要经过多次转换。
        use std::collections::HashSet;
        let mut visited: HashSet<String> = HashSet::new(); // 用来记录访问过的节点
        fn dfs(
            source: &List,
            source_val: List,
            target: &List,
            visited: &mut HashSet<String>,
            coercion: &List,
            cost: i32,
        ) -> (i32, Option<List>) {
            if source == target {
                return (cost, Some(pair![source.clone(), source_val]));
            }

            if visited.contains(&source.to_string()) {
                return (cost, None);
            }

            visited.insert(source.to_string());
            // argtypes: list[list[type_y,trans_to_type_y_func],list[type_z,trans_to_type_z_func],...]
            let mut argtypes = get_type_coercion(source, coercion);
            while !argtypes.is_empty() {
                let type_y = argtypes.head().head();
                let trans_to_type_y_func = argtypes.head().tail().head();
                let new_val = trans_to_type_y_func
                    .try_as_basis_value::<ClosureWrapper>()
                    .unwrap();
                let new_val = new_val.call(&list![source_val.clone()]).unwrap(); // 转换次数+1，cost+1
                let results = dfs(&type_y, new_val, target, visited, coercion, cost + 1);
                if results.1.is_some() {
                    return results;
                }
                argtypes = argtypes.tail();
            }
            return (cost, None);
        }
        let (new_cost, trans_arg) = dfs(
            &type_x,
            input_args.head().head(),
            &func_argtypes.head().head(),
            &mut visited,
            &coercion,
            cost,
        );
        if let Some(trans_arg) = trans_arg {
            let trans_type = trans_arg.head();
            let trans_val = trans_arg.tail();
            // results: list[pair(type1,val1),pair(type2,val2)...].append(list[pair(trans_type,trans_val)])
            let results = results.append(&list![pair!(trans_type, trans_val)]);
            // input_args: list[pair(arg2,type2),...]
            let input_args = input_args.tail();
            // func_types: list[list[type2,type3...],some_func]
            let func_argtypes = list![func_argtypes.head().tail(), func_argtypes.tail()];
            let (cost, flag, results) =
                transform_argtypes(&input_args, func_argtypes, &coercion, results, new_cost);
            return (cost, flag, results.clone());
        } else {
            return (cost, false, List::Nil);
        }
    }
}
// 获取函数的所有可能参数类型列表
fn get_func_argtypes(func_name: &List, args_len: usize, arith: &ArithmeticContext) -> List {
    let optable = arith.optable.clone();
    let assoc = move |args: List| optable("assoc").call(&args);
    let args = assoc(list![func_name.clone()]);
    let msg = format!("get_func_argtypes: func_name {} not found", func_name);
    args.expect(&msg)
        .tail()
        .filter(|args| args.head().length() == args_len)
}

// 获取参数可转换类型列表
fn get_type_coercion(type_x: &List, coercion: &List) -> List {
    coercion
        .filter(|x| {
            //let type1 = x.head();
            x.head() == *type_x
        })
        .map(|x| {
            //let type1 = x.head();
            let type2 = x.tail().head();
            let proc = x.tail().tail().head();
            list![type2, proc]
        })
}

fn main() {
    test_transform()
}
```