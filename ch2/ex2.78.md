# 2.5.1 通用型算术运算
## 练习2.78
包javascript_number里的内部函数基本上什么也没做，只是去调用基本函数+、-等。这里当然不能直接使用语言的基本函数，因为我们的类型标签系统要求给每个数据对象加类型标签。但是，事实上每个JavaScript实现都有自己的类型系统，用在系统内部，并提供基本谓词is_symbol和is_number等确定数据对象是否具有特定类型。请修改2.4.2节type_tag、contents和attach_tag的定义，使我们的通用算术系统能利用JavaScript的内部类型系统。也就是说，修改后的系统应该像原来一样工作，除了其中的常规数直接表示为JavaScript的数，而不用head部分是字符串"javascript_number"的序对。
```javascript
function add(x, y) { return apply_generic("add", list(x, y)); }

function sub(x, y) { return apply_generic("sub", list(x, y)); }

function mul(x, y) { return apply_generic("mul", list(x, y)); }

function div(x, y) { return apply_generic("div", list(x, y)); }

function install_javascript_number_package() {
    function tag(x) {
        return attach_tag("javascript_number", x);
    }
    put("add", list("javascript_number", "javascript_number"), 
        (x, y) => tag(x + y));
    put("sub", list("javascript_number", "javascript_number"), 
        (x, y) => tag(x - y));
    put("mul", list("javascript_number", "javascript_number"), 
        (x, y) => tag(x * y));
    put("div", list("javascript_number", "javascript_number"), 
        (x, y) => tag(x / y));
    put("make", "javascript_number", 
        x => tag(x));
    return "done";
}

function make_javascript_number(n) {
    return get("make", "javascript_number")(n);
}
```

## 解答
#### 原始Rust代码
```rust
use sicp_rs::ch2::ch2_5::*;
use sicp_rs::ch3::ch3_3::make_table_2d;
use sicp_rs::prelude::*;
fn main() {
    // 创建操作符表
    let optable = make_table_2d();
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let put = move |args: List| op_cloned("insert").call(&args);

    install_javascript_number_package(put.clone());
    let x = make_javascript_number(1.0.to_listv(), get.clone());
    let y = make_javascript_number(2.0.to_listv(), get.clone());
    println!("{},{}", x, y);
    println!("{}", add(&x, &y, get));
}
// Output
// ("javascript_number", 1.0),("javascript_number", 2.0)
// ("javascript_number", 3.0)
```
#### 更改后的代码
##### 修改函数`attach_tag`、`type_tag`和`contents`
```rust
pub fn attach_tag(tag: &str, contents: &List) -> List {
    // Only Support f64
    if contents.is_value() && contents.try_as_basis_value::<f64>().is_ok() {      // 新增行
        contents.clone()                                                          // 新增行 
    } else {
        pair!(tag.to_string(), contents.clone())
    }
}
pub fn type_tag(datum: &List) -> List {
    // Only Support f64
    if datum.is_value() && datum.try_as_basis_value::<f64>().is_ok() {   // 新增行
        "javascript_number".to_string().to_listv()                       // 新增行
    } else if datum.is_pair() {
        datum.head()
    } else {
        panic!("bad tagged datum -- TYPE-TAG")
    }
}
pub fn contents(datum: &List) -> List {
    // Only Support f64
    if datum.is_value() && datum.try_as_basis_value::<f64>().is_ok() {   // 新增行
        datum.clone()                                                    // 新增行
    } else if datum.is_pair() {
        datum.tail()
    } else {
        panic!("bad tagged datum -- CONTENTS")
    }
}
```
##### 为什么只支持`f64`类型？
在`sicp`通用型算术系统中，操作符表（二维表格）通过操作符和操作数类型作为键来存储函数。如果要支持所有数字类型（如`i32`、`f32`、`f64` 等），需要在闭包中处理所有可能的类型，这会显得过于啰嗦。而泛型函数是一集函数，并非一个函数，也无法放入二维表格中。因此，这里仅实现对`f64`类型的支持。
```rust
    put(list![
        "add",
        list!["javascript_number", "javascript_number"],
        ClosureWrapper::new(move |args: &List| {
            let x = args.head();
            let y = args.tail().head();
            Some(tag((x.try_as_basis_value::<f64>().unwrap()
                + y.try_as_basis_value::<f64>().unwrap())
            .to_listv()))
        })
    ]);
```
##### 新的`main`函数
```rust
use sicp_rs::ch2::ch2_5::*;
use sicp_rs::ch3::ch3_3::make_table_2d;
use sicp_rs::prelude::*;
fn main() {
    // 创建操作符表
    let optable = make_table_2d();
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let put = move |args: List| op_cloned("insert").call(&args);

    install_javascript_number_package(put.clone());
    println!("{}", add(&1.0.to_listv(), &2.0.to_listv(), get));
}
// Output
// 3.0
```