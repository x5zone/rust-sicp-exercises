# 3.1.3 引进赋值的代价
## 练习3.7
 考虑练习3.3描述的，由make_account创建的带密码的银行账户对象。假定我们的银行系统允许建立合用账户，请声明函数make_joint创建这种账户。函数make_joint应该有三个参数：第一个参数是一个密码保护的账户；第二个参数是密码，它必须与已定义账户的密码匹配，使make_joint操作能继续；第三个参数是一个新密码。make_joint用这个新密码创建对原账户的另一条访问路径。例如，如果peter_acc是具有密码"open sesame"的银行账户，那么
 ```javascript
 const paul_acc = make_joint(peter_acc, "open sesame", "rosebud");
 ```
 使人可以通过名字paul_acc和密码"rosebud"对账户peter_acc做交易。请修改你针对练习3.3的解，加入这一新功能。

 ## 解答
 make_account返回闭包（或者说对象），而make_joint则是对make_account返回的闭包的再包装，同样返回的是闭包。代码如下:
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

fn make_joint(
    acc: &impl Fn(&str, &str) -> List,
    old_passwd: String,
    new_passwd: String,
) -> impl Fn(&str, &str) -> List {
    fn acc_closure(acc: &impl Fn(&str, &str) -> List, passwd: &str, cmd: &str) -> ClosureWrapper {
        acc(passwd, cmd)
            .try_as_basis_value::<ClosureWrapper>()
            .expect("Wrong linked account password")
            .clone()
    }
    let with_draw = acc_closure(acc, old_passwd.as_str(), "withdraw");
    let deposit = acc_closure(acc, old_passwd.as_str(), "deposit");

    let dispatch = {
        move |pass: &str, m: &str| {
            if pass != new_passwd.as_str() {
                return "Wrong joint account password".to_listv();
            }
            match m {
                "withdraw" => with_draw.clone().to_listv(),
                "deposit" => deposit.clone().to_listv(),
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
    let peter_acc = make_account(200, "open sesame".to_string());
    let paul_acc = make_joint(&peter_acc, "open sesame".to_string(), "rosebud".to_string());
    println!(
        "{}",
        handle_response(peter_acc("open sesame", "withdraw"), 100)
    );
    println!("{}", handle_response(paul_acc("rosebud", "withdraw"), 100));
    println!("{}", handle_response(paul_acc("rosebud", "deposit"), 10));
    println!(
        "{}",
        handle_response(paul_acc("open sesame", "withdraw"), 5)
    );
    println!("{}", handle_response(paul_acc("rosebud", "withdraw"), 20));
}
```