# 2.3.3 实例：集合的表示
## 练习2.60
我们前面说明了如何把集合表示为没有重复元素的表。现在假定允许重复，例如，集合{1, 2, 3}可能被表示为表list(2, 3, 2,1, 3, 2, 2)。请为在这种表示上的操作设计函数is_element_of_set、adjoin_set，union_set和intersection_set。与前面不允许重复的表示里的相应操作相比，现在这些操作的效率如何？在什么样的应用中你更倾向于使用这种表示，而不用前面那种无重复的表示？

## 解答
* 与上一节相比,代码无须任何修改,仍可以正常工作.
* 存储效率显然下降,因为冗余存储了相同元素.
* 执行效率依函数而定:
    * is_element_of_set: 若数据是集合中的元素,从概率上看,效率提升,因为更多副本会更有可能更早命中;若数据不是集合中的元素,则效率降低,因为需要遍历整个集合,而整个集合因为有冗余元素,可能会更长.
    * adjoin_set: 可直接加入到集合中,无需判断,变为一个O(1)的操作(相比习题2.59略作修改即可,此处省略).
    * intersection_set: 与is_element_of_set类似,效率是否提升取决于数据在集合中的概率.
    * union_set: 可以直接合并两个集合,内存拷贝效率忽略的前提下,效率提升(相比习题2.59略作修改即可,此处省略).
* 一般而言,我不会使用这样的集合表示.满足数学定义的集合,更符合人们的一般预期,有重复元素的集合可能会给人带来迷惑?
    * 设想这么一个场景,mapreduce的worldcount,在reduce阶段之前,可以理解为一个有重复元素的集合,但reduce阶段之后,就会变成一个无重复元素的集合.
    * 若数据为log_id,session_id,global_id等等,则可以使用这种集合表示,因为数据有极大概率不重复,是数据本身的特性,使用允许重复的集合表示可以提升性能.