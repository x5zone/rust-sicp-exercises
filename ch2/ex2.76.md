# 2.4.3 数据导向的程序设计和可加性
## 练习2.76
包含通用型操作的大型系统也可能不断演化，在演化中经常需要加入新的数据对象类型或者新的操作。请针对上面提出的三种策略——采用显式分派的通用型操作、数据导向的风格，以及消息传递的风格——分别说明在加入一个新类型或者新操作时，我们必须对系统做哪些修改。哪种组织方式最适合经常需要加入新类型的系统？哪种组织方式最适合经常需要加入新操作的系统？

## 解答
#### 三种策略的优缺点
* 显式分派的通用型操作
    * > 检查一个数据的类型，并根据情况调用适当函数，这种普适的策略称为基于类型的分派。这是在系统设计中获得模块性的一种功能强大的策略。但另一方面，像2.4.2节那样实现分派有两个重要弱点。第一个弱点是，通用型接口函数（real_part、imag_part、magnitude和angle）必须知道所有的不同表示。例如，假定现在我们希望为复数系统增加另一种新表示，就必须把这一新表示标识为一种新类型，而且还要给每个通用接口函数增加一个子句，由它检查这种新类型，并对这种新表示调用适当的选择函数。这种技术还有另一个弱点：虽然各个独立的表示形式可以分别设计，但我们还必须保证在整个系统里不存在两个名字相同的函数。正是因为这个原因，Ben和Alyssa必须修改自己在前面2.4.1节给出的那些函数的名字。
    * 加入新类型: 为每个通用接口函数增加一个子句，用于处理新类型。并且同时需要注意新类型的名字不与已有类型冲突。这种方式的耦合性非常高，每次新增类型都需要修改多个地方。
    * 加入新操作: 需要新增一个通用接口函数，并为所有已有类型添加处理逻辑。这种方式随着类型数量的增加，维护成本会显著增加。
    * 总结：显式分派的方式是最不灵活的，适合小型系统，但不适合频繁扩展的场景。
* 数据导向的风格
    * > 当我们需要处理针对一集不同类型的一集公共的通用型操作时，事实上，我们要做的就是处理一个二维表格，其中的一个维是所有的可能操作，另一个维是所有的可能类型。表格中的项目是一些函数，它们针对各种不同的参数类型实现各个操作。数据导向的程序设计技术，也就是让程序直接在这种表格上工作。前面我们用一集函数作为复数算术与两个表示包之间的接口，让每个函数去做基于类型的显式分派。下面我们要把这个接口实现为一个单一函数，让它基于操作名和参数类型的组合，到表中去找到正确的函数，然后将其应用于参数的内容。数据导向的程序设计中最核心的想法，就是通过显式处理操作-类型表格的方式，管理程序里的各种通用型操作。
    * 加入新类型：只需在操作-类型表格中添加新类型及其对应的操作实现，改动集中在表格中，较为简单。
    * 加入新操作：要为表格中的所有类型添加新操作的实现。虽然需要处理所有类型，但操作逻辑集中在表格中，易于维护。
    * 总结：这种方式适合频繁新增操作的场景，表格的集中管理降低了遗漏风险。
* 消息传递的风格
    * > 另一种实现策略是按列分解表格，不是用“智能操作”去做基于数据类型的分派，而是用“智能数据对象”​，让它们基于操作名去做分派。这种风格的程序设计称为消息传递，这个名字源自一种看法：一个数据对象是一个实体，它以“消息”的方式接收需要执行的操作的名字。
    * 加入新类型：直接定义新的智能数据对象即可，无需修改已有代码。这种方式对新增类型非常友好。
    * 加入新操作：已有类型为智能数据对象，面对新操作，都必须进行修改以处理新操作的消息。需要修改所有已有类型的实现，以处理新操作的消息。这种方式对新增操作不友好。
    * 总结：这种方式适合频繁新增类型的场景，但新增操作的成本较高。
#### 最适合的场景
* 经常加入新类型：消息传递的风格最适合，因为新增类型无需修改已有代码。
* 经常加入新操作：数据导向的风格最适合，因为操作逻辑集中在表格中，易于管理。
#### Rust 的现代化实现
* 频繁新增类型：使用特征对象（dyn Trait），新增类型只需实现特征。
* 频繁新增操作：使用枚举或表格，操作逻辑集中管理。
