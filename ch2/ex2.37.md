# 2.2.3 序列作为约定的接口
## 练习2.37
假设我们把向量$v=(v_i)$表示为数的序列，把矩阵$m=(m_{ij})$表示为向量（矩阵行）的序列。例如，矩阵：
$$\begin{bmatrix}
1 & 2 & 3 & 4 \\
4 & 5 & 6 & 6 \\
6 & 7 & 8 & 9
\end{bmatrix}$$
可以用下面的序列表示：
```javascript
list(list(1, 2, 3, 4),
     list(4, 5, 6, 6),
     list(6, 7, 8, 9))
```
有了这种表示，我们就可以利用序列操作，简洁地描述各种基本的矩阵与向量运算了。例如如下的这些运算（任何有关矩阵代数的书里都有说明）​：
$$dot\_product(v, w) \quad 返回和 \ \sum_i v_i w_i;$$

$$matrix\_times\_vector(m, v) \quad 返回向量 \ t, \ 其中 \ t_i = \sum_j m_{ij} v_j;$$

$$matrix\_times\_matrix(m, n) \quad 返回矩阵 \ p, \ 其中 \ p_{ij} = \sum_k m_{ik} n_{kj};$$

$$transpose(m) \quad 返回矩阵 \ n, \ 其中 \ n_{ij} = m_{ji}.$$
其中的点积(dot product)函数可以如下声明：
```javascript
function dot_product(v, w) {
    return accumulate(plus, 0, accumulate_n(times, 1, list(v, w)));
}
```
请填充下面函数声明里空缺的表达式，使所定义的函数能完成另外那些矩阵运算的计算（函数accumulate_n在练习2.36中定义）​。
```javascript
function matrix_times_vector(m, v) {
    return map(<??>, m);
}
function transpose(mat) {
    return accumulate_n(<??>, <??>, mat);
}
function matrix_times_matrix(n, m) {
    const cols = transpose(n);
    return map(<??>, m);
}
```

## 解答
* matrix_times_vector：matrix_times_vector对比dot_product，m的每一行需要和$v_j$进行dot_product运算。而m的每一行均为一个子表。map中传递dot_product函数逐行进行运算即可。
* transpose：accumulate_n函数会取出每行(每个子表中的元素)，如果对取出的元素执行times，就是题目中的dot_product运算。现在我们需要找到一个运算方式，可以让这些元素变成一行，显然，这个运算为pair运算。
    * 注意不能使用list，参看accumulate_n的定义，会发现如果使用list，会最终形成list(1,list(2,list(3,list(4...))))这样的嵌套列表，显然不符合要求。
* matrix_times_matrix: $p_{ij} = dot\_product(m\_row(i), n\_col(j))$，而$p\_row(i) = matrix\_times\_vector(m\_row(i), transpose(n))$，matrix_times_vector返回一个向量，该向量即为$p\_row(i)$，我们可以对于固定j为某个值，则matrix_times_vector运算就退化为点积运算，例如固定j等于1，则转置矩阵n的第一行与$m\_row(i)$进行点积运算，结果为返回值向量的$t_1$，也是$p_{i1}$，从而验证通过。ps: 题目中函数声明为matrix_times_matrix(n, m)，会让人迷惑以为是$n*m$，而不是$m*n$。  

* 填空如下:
```javascript
function matrix_times_vector(m, v) {
    return map(y => dot_product(y, v), m);
}
function transpose(mat) {
    return accumulate_n(pair, null, mat);
}
function matrix_times_matrix(n, m) {
    const cols = transpose(n);
    return map(y => matrix_times_vector(cols, y), m);
}
```
* rust代码如下:
```rust
//依赖代码见习题2.17&习题2.33&习题2.36
fn dot_product<T: Clone + Num + Debug>(v: &List<T>, w: &List<T>) -> T {
    List::from_slice(&[(*v).clone(), (*w).clone()])
        .accumulate_n(|x, y| List::V(x.value() * y.value()), List::V(T::one()))
        .accumulate(|x, y| List::V(x.value() + y.value()), List::V(T::zero()))
        .value()
}
fn matrix_times_vector<T: Clone + Num + Debug>(m: &List<T>, v: &List<T>) -> List<T> {
    m.map(|y| List::V(dot_product(y, v)))
}
fn transpose<T: Clone + Num + Debug>(mat: &List<T>) -> List<T> {
    mat.accumulate_n(|x, y| List::pair((*x).clone(), y), List::Nil)
}
fn matrix_times_matrix<T: Clone + Num + Debug>(n: &List<T>, m: &List<T>) -> List<T> {
    let cols = transpose(n);
    m.map(|y| matrix_times_vector(&cols, y))
}
fn main() {
    use List::*;
    //测试 dot_product
    let v1 = List::from_slice(&[V(1), V(2), V(3)]);
    let v2 = List::from_slice(&[V(4), V(5), V(6)]);
    let dot_result = dot_product(&v1, &v2);
    println!("Dot product of {} and {} is: {}", v1, v2, dot_result); // 输出: 32

    // 测试 matrix_times_vector
    let matrix = List::from_slice(&[
        List::from_slice(&[V(1), V(2), V(3)]),
        List::from_slice(&[V(4), V(5), V(6)]),
        List::from_slice(&[V(7), V(8), V(9)]),
    ]);
    let vector = List::from_slice(&[V(1), V(2), V(3)]);
    let matrix_vector_result = matrix_times_vector(&matrix, &vector);
    println!(
        "Matrix {} times vector {} is: {}",
        matrix, vector, matrix_vector_result
    );
    // 输出: [14, 32, 50]

    // 测试 transpose
    let matrix_for_transpose = List::from_slice(&[
        List::from_slice(&[V(1), V(2), V(3)]),
        List::from_slice(&[V(4), V(5), V(6)]),
        List::from_slice(&[V(7), V(8), V(9)]),
    ]);
    let transposed_matrix = transpose(&matrix_for_transpose);
    println!(
        "Transpose of matrix {} is: {}",
        matrix_for_transpose, transposed_matrix
    );
    // 输出: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]

    // 测试 matrix_times_matrix
    let matrix_a = List::from_slice(&[
        List::from_slice(&[V(1), V(2), V(3)]),
        List::from_slice(&[V(4), V(5), V(6)]),
    ]);
    let matrix_b = List::from_slice(&[
        List::from_slice(&[V(7), V(8)]),
        List::from_slice(&[V(9), V(10)]),
        List::from_slice(&[V(11), V(12)]),
    ]);
    let matrix_multiplication_result = matrix_times_matrix(&matrix_b, &matrix_a);
    println!(
        "Matrix {} times matrix {} is: {}",
        matrix_b, matrix_a, matrix_multiplication_result
    );
    //输出: [[58, 64], [139, 154]]
}
```