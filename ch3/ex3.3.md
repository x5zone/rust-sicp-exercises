# 3.1.1 局部状态变量
## 练习3.3
请修改make_account函数，使它能创建一种带密码保护的账户。也就是说，函数make_account应该增加一个字符串的参数，例如：
```javascript
function make_account(balance) {
    function withdraw(amount) {
        if (balance >= amount) {
            balance = balance - amount;
            return balance;
        } else {
            return "Insufficient funds";
        }
    }
    function deposit(amount) {
        balance = balance + amount;
        return balance;
    }
    function dispatch(m) {
        return m === "withdraw"
               ? withdraw
               : m === "deposit"
               ? deposit
               : error(m, "unknown request -- make_account");
    }
    return dispatch;
}
```
```javascript
const acc = make_account(100, "secret password");
```
这样产生的账户对象在接到一个请求时，只有同时提供了账户创建时给定的密码，它才处理这一请求，否则就发出一个抱怨信息：
```javascript
acc("secret password", "withdraw")(40); // 60
acc("some other password", "deposit")(40); // "Incorrect password"
```

## 解答
本习题比较简单，不再赘述。
```rust
use std::{cell::RefCell, rc::Rc};

use sicp_rs::prelude::*;
fn extract_value(x: &List) -> i32 {
    x.try_as_basis_value::<i32>()
        .expect("Expected an i32 value")
        .clone()
}
fn make_account(balance: i32, passwd: String) -> impl Fn(&str, &str) -> List {
    let balance = Rc::new(RefCell::new(balance));

    let withdraw = {
        let balance = balance.clone();
        Rc::new(move |x: &List| {
            let x = extract_value(x);
            let mut b = balance.borrow_mut();
            if *b < x {
                return "Insufficient funds".to_listv();
            };
            *b -= x;
            (*b).to_listv()
        })
    };
    let deposit = {
        let balance = balance.clone();
        Rc::new(move |x: &List| {
            let x = extract_value(x);
            let mut b = balance.borrow_mut();
            *b += x;
            (*b).to_listv()
        })
    };
    let dispatch = {
        move |pass: &str, m: &str| {
            if pass != passwd.as_str() {
                return "Incorrect password".to_listv();
            }

            match m {
                // dispatch可能被调用多次，每次均消耗withdraw，故withdraw需要Rc包裹
                "withdraw" => ClosureWrapper::new({
                    let withdraw = withdraw.clone();
                    move |x| Some(withdraw(x).to_listv())
                })
                .to_listv(),
                "deposit" => ClosureWrapper::new({
                    let deposit = deposit.clone();
                    move |x| Some(deposit(x).to_listv())
                })
                .to_listv(),
                _ => "Unknown request -- MAKE-ACCOUNT".to_listv(),
            }
        }
    };
    dispatch
}

fn handle_response(response: List, x: i32) -> List {
    response.try_as_basis_value::<ClosureWrapper>().map_or_else(
        |_| response.clone(),                           // 如果不是闭包，直接返回原值
        |closure| closure.call(&x.to_listv()).unwrap(), // 如果是闭包，调用它
    )
}
fn main() {
    let acc = make_account(100, "secret password".to_string());
    println!(
        "{}",
        handle_response(acc("secret password", "withdraw"), 40)
    );
    println!(
        "{}",
        handle_response(acc("secret password", "withdraw"), 40)
    );
    println!(
        "{}",
        handle_response(acc("some other password", "withdraw"), 40)
    );
    println!(
        "{}",
        handle_response(acc("secret password", "withdraw"), 40)
    );
}
```