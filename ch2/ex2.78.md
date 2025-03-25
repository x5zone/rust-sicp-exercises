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
#### main函数
```rust
use sicp_rs::ch2::ch2_5::{ArithmeticContext, install_float_package, make_float};
fn main() {
    // 创建通用算术包上下文
    let arith = ArithmeticContext::new();
    install_float_package(&arith);       // float即对应于javascript_number

    let (x, y) = (make_float(1.0, &arith), make_float(2.0, &arith));
    println!("{} + {} = {}", x, y, arith.add(&x, &y));
}
// Output
// (float, 1.0) + (float, 2.0) = (float, 3.0)
```
#### 修改lib代码
##### 修改函数`attach_tag`、`type_tag`和`contents`
```rust
pub fn attach_tag(tag: &str, contents: &List) -> List {
    //Only Support f64&i32
    if contents.is_value()                                             // 新增行
        && (contents.try_as_basis_value::<f64>().is_ok()               // 新增行
            || contents.try_as_basis_value::<i32>().is_ok())           // 新增行
    {
        return contents.clone();                                       // 新增行 
    };
    pair!(tag.to_string(), contents.clone())
}

pub fn type_tag(datum: &List) -> List {
    // Only Support f64&i32
    if datum.is_value() && datum.try_as_basis_value::<f64>().is_ok() {         // 新增行
        "float".to_listv()                                                     // 新增行
    } else if datum.is_value() && datum.try_as_basis_value::<i32>().is_ok() {  // 新增行
        "integer".to_listv()                                                   // 新增行
    } else if datum.is_pair() {
        datum.head()
    } else {
        panic!("bad tagged datum -- TYPE-TAG")
    }
}

pub fn contents(datum: &List) -> List {
    // Only Support f64&i32
    if datum.is_value()                                                        // 新增行
        && (datum.try_as_basis_value::<f64>().is_ok() || datum.try_as_basis_value::<i32>().is_ok())  // 新增行
    {
        datum.clone()                                                          // 新增行   
    } else if datum.is_pair() {
        datum.tail()
    } else {
        panic!("bad tagged datum -- CONTENTS")
    }
}
```
##### 修改lib后输出
```rust
// 1.0 + 2.0 = 3.0
```
##### 为什么只支持`f64`类型？
在`sicp`通用型算术系统中，操作符表（二维表格）通过操作符和操作数类型作为键来存储函数。如果要支持所有数字类型（如`f32`、`f64` 等），需要在闭包中处理所有可能的类型，这会显得过于啰嗦。而泛型函数是一集函数，并非一个函数，也无法放入二维表格中。因此，这里仅实现对`f64`类型的支持。
```rust
 pub fn install_float_package(arith: &ArithmeticContext) -> Option<List> {
    install_basic_numeric_type::<f64>(               // 指定泛型类型为f64
        "float",
        {
            let arith = arith.clone();
            move |x| make_float(x, &arith)
        },
        arith,
    );
    Some("done".to_string().to_listv())
}
```
