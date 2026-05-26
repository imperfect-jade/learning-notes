<!-- learning-notes
course: 机器学习
textbook: 《机器学习》（西瓜书）；《机器学习实战》
style: exam-review
source_policy: references-section
last_updated: 2026-05-26
-->

# 机器学习

机器学习（Machine Learning）研究如何让计算机从数据中自动获得规律，并把规律用于预测、分类、聚类、降维、异常检测和决策。复习时不要只背算法名字，要始终围绕一条主线：**用数据定义任务，用模型表达假设，用损失函数衡量错误，用优化算法学习参数，用评估方法检验泛化能力**。

!!! tip "复习抓手"
    机器学习题目通常可以拆成五问：这是监督还是无监督？输入、输出、损失函数是什么？模型复杂度在哪里？如何优化参数？如何验证模型对新数据有效？

## 一、机器学习总览

### 1.1 两个经典定义

- Arthur Samuel：机器学习让计算机在没有被显式编程的情况下获得学习能力。
- Tom Mitchell：若程序在任务 \(T\) 上，基于经验 \(E\)，通过性能度量 \(P\) 评价后表现提升，则称程序从经验中学习。

三元组表示：

```text
Task T        要完成什么任务
Experience E 从什么数据或交互中学习
Performance P 用什么指标评价效果
```

例：垃圾邮件分类。

| 元素 | 内容 |
| --- | --- |
| \(T\) | 判断邮件是否为垃圾邮件 |
| \(E\) | 已标注的邮件数据 |
| \(P\) | 准确率、召回率、F1、AUC |

### 1.2 机器学习基本流程

```text
原始数据
  -> 数据清洗
  -> 特征工程 / 表示学习
  -> 划分训练集、验证集、测试集
  -> 选择模型
  -> 训练参数
  -> 调参和模型选择
  -> 测试集评估
  -> 部署与监控
```

### 1.3 机器学习分类

| 类型 | 数据特点 | 目标 | 常见算法 |
| --- | --- | --- | --- |
| 监督学习 | 有标签 \(y\) | 学习 \(x \to y\) 的映射 | 线性回归、逻辑回归、SVM、决策树 |
| 无监督学习 | 无标签 | 发现数据结构 | K-Means、层次聚类、PCA |
| 半监督学习 | 少量标签 + 大量无标签 | 利用无标签数据辅助学习 | 标签传播、伪标签 |
| 强化学习 | 智能体与环境交互 | 最大化长期奖励 | Q-learning、策略梯度 |

监督学习继续分为：

| 任务 | 输出 | 示例 |
| --- | --- | --- |
| 回归 | 连续值 | 房价、气温、销量 |
| 分类 | 离散类别 | 肿瘤良恶性、垃圾邮件、图片类别 |
| 排序 | 有序列表 | 搜索排序、推荐排序 |

### 1.4 核心术语

| 术语 | 含义 |
| --- | --- |
| 样本 \(x\) | 一条输入数据 |
| 标签 \(y\) | 监督学习中的真实输出 |
| 特征 \(x_j\) | 样本的一个属性 |
| 模型 \(f\) | 输入到输出的映射 |
| 参数 \(\theta\) | 模型从数据中学到的变量 |
| 超参数 | 训练前设定的配置，如学习率、树深度、正则化系数 |
| 损失函数 | 单个样本预测错误大小 |
| 代价函数 | 全部训练样本平均错误 |
| 泛化能力 | 模型在未知数据上的表现 |

### 1.5 数学记号

| 记号 | 含义 |
| --- | --- |
| \(m\) | 样本数量 |
| \(n\) | 特征数量 |
| \(x^{(i)}\) | 第 \(i\) 个样本 |
| \(x_j^{(i)}\) | 第 \(i\) 个样本的第 \(j\) 个特征 |
| \(y^{(i)}\) | 第 \(i\) 个样本的标签 |
| \(X\) | 设计矩阵，大小 \(m \times n\) 或 \(m \times (n+1)\) |
| \(\theta\) | 参数向量 |
| \(h_\theta(x)\) | 假设函数或预测函数 |

## 二、模型评估与泛化

### 2.1 数据集划分

| 数据集 | 作用 |
| --- | --- |
| 训练集 | 拟合模型参数 |
| 验证集 | 调超参数、选模型 |
| 测试集 | 最终只评估一次，估计泛化性能 |

常见划分：

```text
训练集 60% / 验证集 20% / 测试集 20%
训练集 70% / 验证集 15% / 测试集 15%
```

数据较少时常用 \(k\)-折交叉验证。

```text
Fold 1: [valid] [train] [train] [train] [train]
Fold 2: [train] [valid] [train] [train] [train]
...
```

### 2.2 回归指标

均方误差：

\[
MSE = \frac{1}{m}\sum_{i=1}^{m}(\hat{y}^{(i)}-y^{(i)})^2
\]

均方根误差：

\[
RMSE = \sqrt{MSE}
\]

平均绝对误差：

\[
MAE = \frac{1}{m}\sum_{i=1}^{m}|\hat{y}^{(i)}-y^{(i)}|
\]

决定系数：

\[
R^2 = 1 - \frac{\sum_{i=1}^{m}(y^{(i)}-\hat{y}^{(i)})^2}{\sum_{i=1}^{m}(y^{(i)}-\bar{y})^2}
\]

| 指标 | 特点 |
| --- | --- |
| MSE | 对大误差惩罚强，常用于优化 |
| RMSE | 与标签单位一致，更容易解释 |
| MAE | 对异常值更稳健 |
| \(R^2\) | 衡量相对均值模型提升多少 |

### 2.3 分类指标

混淆矩阵：

| 真实/预测 | 预测正类 | 预测负类 |
| --- | --- | --- |
| 真实正类 | TP | FN |
| 真实负类 | FP | TN |

准确率：

\[
Accuracy = \frac{TP+TN}{TP+FP+TN+FN}
\]

精确率：

\[
Precision = \frac{TP}{TP+FP}
\]

召回率：

\[
Recall = \frac{TP}{TP+FN}
\]

F1：

\[
F1 = \frac{2 \times Precision \times Recall}{Precision + Recall}
\]

**选择指标的直觉**：

- 垃圾邮件：误杀正常邮件代价高，关注 precision。
- 疾病筛查：漏诊代价高，关注 recall。
- 类别不平衡：不要只看 accuracy，应看 F1、PR-AUC、ROC-AUC。

### 2.4 偏差、方差与泛化误差

模型误差可直观分解为：

```text
泛化误差 = 偏差 + 方差 + 噪声
```

| 情况 | 训练误差 | 验证误差 | 典型原因 |
| --- | --- | --- | --- |
| 欠拟合 | 高 | 高 | 模型太简单、特征不足、训练不充分 |
| 过拟合 | 低 | 高 | 模型太复杂、数据少、噪声多 |
| 合适 | 低 | 低 | 模型复杂度与数据匹配 |

```text
模型复杂度增加:

训练误差:  高 ---------> 低
验证误差:  高 ----低----> 高
              欠拟合  合适  过拟合
```

### 2.5 学习曲线

学习曲线用于诊断模型问题。

```text
样本数增加时:

欠拟合:
训练误差高，验证误差也高，二者接近

过拟合:
训练误差低，验证误差高，二者差距大
```

应对策略：

| 问题 | 优先尝试 |
| --- | --- |
| 高偏差 | 增加特征、提高模型复杂度、减少正则化 |
| 高方差 | 增加数据、增强正则化、降维、简化模型 |

## 三、线性回归

### 3.1 适用场景

线性回归用于预测连续值，是监督学习中最基础的回归模型。

例：

- 房屋面积、房间数预测房价。
- 广告投入预测销售额。
- 温度、湿度预测能耗。

### 3.2 一元线性回归

假设函数：

\[
h_\theta(x) = \theta_0 + \theta_1 x
\]

其中：

- \(\theta_0\)：截距项，也称 bias。
- \(\theta_1\)：斜率或权重。
- \(x\)：输入特征。

代价函数使用均方误差的一半：

\[
J(\theta_0,\theta_1)
= \frac{1}{2m}\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})^2
\]

乘以 \(\frac{1}{2}\) 是为了求导时抵消平方项系数。

### 3.3 梯度下降

参数同步更新：

\[
\theta_j := \theta_j - \alpha \frac{\partial}{\partial \theta_j}J(\theta)
\]

一元线性回归中：

\[
\theta_0 := \theta_0 - \alpha \frac{1}{m}\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})
\]

\[
\theta_1 := \theta_1 - \alpha \frac{1}{m}\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})x^{(i)}
\]

**学习率 \(\alpha\)**：

| 情况 | 表现 |
| --- | --- |
| 太小 | 收敛很慢 |
| 合适 | 代价函数稳定下降 |
| 太大 | 震荡、发散、代价上升 |

### 3.4 多元线性回归

多特征形式：

\[
h_\theta(x) = \theta_0 + \theta_1x_1 + \theta_2x_2 + \cdots + \theta_nx_n
\]

向量化形式：

\[
h_\theta(x)=\theta^Tx
\]

其中令 \(x_0=1\)：

\[
x =
\begin{bmatrix}
1 \\
x_1 \\
\vdots \\
x_n
\end{bmatrix},
\quad
\theta =
\begin{bmatrix}
\theta_0 \\
\theta_1 \\
\vdots \\
\theta_n
\end{bmatrix}
\]

整体代价：

\[
J(\theta)=\frac{1}{2m}\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})^2
\]

梯度更新：

\[
\theta_j := \theta_j - \alpha \frac{1}{m}
\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})x_j^{(i)}
\]

矩阵形式：

\[
\theta := \theta - \alpha \frac{1}{m}X^T(X\theta-y)
\]

### 3.5 正规方程

对于线性回归，可直接求闭式解：

\[
\theta = (X^TX)^{-1}X^Ty
\]

若 \(X^TX\) 不可逆，可使用伪逆：

\[
\theta = X^+y
\]

| 方法 | 优点 | 缺点 |
| --- | --- | --- |
| 梯度下降 | 适合大数据、高维、在线优化 | 需要学习率和迭代次数 |
| 正规方程 | 无需调学习率，一步求解 | 矩阵求逆代价高，不适合特征极多 |

### 3.6 特征缩放

梯度下降前常做标准化：

\[
x' = \frac{x-\mu}{\sigma}
\]

或归一化：

\[
x' = \frac{x-x_{min}}{x_{max}-x_{min}}
\]

特征缩放不会改变线性模型表达能力，但能让梯度下降更快收敛。

### 3.7 实验代码：从零实现线性回归

??? example "Code"
    ```python
    import numpy as np
    import matplotlib.pyplot as plt

    def add_bias(X):
        return np.c_[np.ones((X.shape[0], 1)), X]

    def standardize(X):
        mean = X.mean(axis=0)
        std = X.std(axis=0)
        return (X - mean) / std, mean, std

    def compute_mse_cost(X_b, y, theta):
        m = len(y)
        error = X_b @ theta - y
        return (error @ error) / (2 * m)

    def gradient_descent(X_b, y, alpha=0.1, epochs=1000):
        m, n = X_b.shape
        theta = np.zeros(n)
        history = []

        for _ in range(epochs):
            error = X_b @ theta - y
            gradient = (X_b.T @ error) / m
            theta -= alpha * gradient
            history.append(compute_mse_cost(X_b, y, theta))

        return theta, history

    X = np.array([[50, 1], [60, 1], [70, 2], [80, 2], [90, 3], [100, 3]], dtype=float)
    y = np.array([120, 140, 165, 190, 215, 240], dtype=float)

    X_scaled, mean, std = standardize(X)
    X_b = add_bias(X_scaled)
    theta, history = gradient_descent(X_b, y, alpha=0.1, epochs=1000)

    new_house = np.array([[110, 3]], dtype=float)
    new_house_scaled = (new_house - mean) / std
    prediction = add_bias(new_house_scaled) @ theta

    print("theta:", theta)
    print("预测房价:", prediction[0])

    plt.plot(history)
    plt.xlabel("epoch")
    plt.ylabel("cost")
    plt.title("Linear Regression Training Curve")
    plt.show()
    ```

## 四、逻辑回归

### 4.1 适用场景

逻辑回归用于分类，尤其适合二分类。

例：

- 肿瘤良性/恶性。
- 邮件正常/垃圾。
- 用户是否流失。

### 4.2 Sigmoid 函数

线性部分：

\[
z=\theta^Tx
\]

Sigmoid：

\[
g(z)=\frac{1}{1+e^{-z}}
\]

假设函数：

\[
h_\theta(x)=g(\theta^Tx)
\]

输出可解释为：

\[
h_\theta(x)=P(y=1|x;\theta)
\]

### 4.3 决策边界

默认阈值为 0.5：

\[
h_\theta(x)\ge 0.5 \Rightarrow y=1
\]

因为 \(g(0)=0.5\)，决策边界满足：

\[
\theta^Tx=0
\]

若加入多项式特征，则逻辑回归可形成非线性边界。

### 4.4 交叉熵损失

单样本损失：

\[
Cost(h_\theta(x),y)=
\begin{cases}
-\log(h_\theta(x)), & y=1 \\
-\log(1-h_\theta(x)), & y=0
\end{cases}
\]

合并写法：

\[
Cost(h_\theta(x),y)
=-y\log(h_\theta(x))-(1-y)\log(1-h_\theta(x))
\]

整体代价：

\[
J(\theta)=
-\frac{1}{m}\sum_{i=1}^{m}
\left[
y^{(i)}\log(h_\theta(x^{(i)}))
+(1-y^{(i)})\log(1-h_\theta(x^{(i)}))
\right]
\]

### 4.5 梯度下降

逻辑回归的梯度形式与线性回归相似，但 \(h_\theta(x)\) 是 Sigmoid 后的概率。

\[
\theta_j := \theta_j - \alpha \frac{1}{m}
\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})x_j^{(i)}
\]

矩阵形式：

\[
\theta := \theta - \alpha \frac{1}{m}X^T(h_\theta(X)-y)
\]

### 4.6 多分类

常见策略：

| 方法 | 思路 |
| --- | --- |
| One-vs-Rest | 每个类别训练一个“该类 vs 其他类”分类器 |
| Softmax Regression | 一次性输出多个类别概率 |

Softmax：

\[
P(y=k|x)=\frac{e^{\theta_k^Tx}}{\sum_{j=1}^{K}e^{\theta_j^Tx}}
\]

### 4.7 实验代码：从零实现逻辑回归

??? example "Code"
    ```python
    import numpy as np
    import matplotlib.pyplot as plt

    def sigmoid(z):
        z = np.clip(z, -500, 500)
        return 1 / (1 + np.exp(-z))

    def add_bias(X):
        return np.c_[np.ones((X.shape[0], 1)), X]

    def logistic_cost(X_b, y, theta):
        m = len(y)
        h = sigmoid(X_b @ theta)
        eps = 1e-12
        return -(y @ np.log(h + eps) + (1 - y) @ np.log(1 - h + eps)) / m

    def train_logistic_regression(X_b, y, alpha=0.1, epochs=3000):
        m, n = X_b.shape
        theta = np.zeros(n)
        history = []

        for _ in range(epochs):
            h = sigmoid(X_b @ theta)
            gradient = (X_b.T @ (h - y)) / m
            theta -= alpha * gradient
            history.append(logistic_cost(X_b, y, theta))

        return theta, history

    X = np.array([
        [1.0, 2.0], [2.0, 1.0], [2.5, 2.0], [3.0, 1.5],
        [4.0, 4.0], [5.0, 3.5], [5.5, 5.0], [6.0, 4.5]
    ])
    y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

    mean = X.mean(axis=0)
    std = X.std(axis=0)
    X_scaled = (X - mean) / std
    X_b = add_bias(X_scaled)

    theta, history = train_logistic_regression(X_b, y)
    prob = sigmoid(X_b @ theta)
    pred = (prob >= 0.5).astype(int)

    print("theta:", theta)
    print("accuracy:", (pred == y).mean())

    plt.plot(history)
    plt.xlabel("epoch")
    plt.ylabel("cross entropy")
    plt.title("Logistic Regression Training Curve")
    plt.show()
    ```

## 五、正则化与过拟合控制

### 5.1 过拟合与欠拟合

| 问题 | 现象 | 处理 |
| --- | --- | --- |
| 欠拟合 | 训练集和验证集都差 | 加特征、换复杂模型、减少正则化 |
| 过拟合 | 训练好、验证差 | 加数据、正则化、简化模型、早停 |

### 5.2 L2 正则化

线性回归：

\[
J(\theta)=
\frac{1}{2m}
\left[
\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})^2
+\lambda\sum_{j=1}^{n}\theta_j^2
\right]
\]

逻辑回归：

\[
J(\theta)=
-\frac{1}{m}\sum_{i=1}^{m}
\left[
y^{(i)}\log(h_\theta(x^{(i)}))
+(1-y^{(i)})\log(1-h_\theta(x^{(i)}))
\right]
+\frac{\lambda}{2m}\sum_{j=1}^{n}\theta_j^2
\]

通常不正则化 \(\theta_0\)。

参数更新：

\[
\theta_0 := \theta_0 - \alpha \frac{1}{m}
\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})x_0^{(i)}
\]

\[
\theta_j := \theta_j - \alpha
\left[
\frac{1}{m}\sum_{i=1}^{m}(h_\theta(x^{(i)})-y^{(i)})x_j^{(i)}
+\frac{\lambda}{m}\theta_j
\right],\quad j\ge 1
\]

### 5.3 L1 正则化

\[
J(\theta)=J_{original}(\theta)+\lambda\sum_{j=1}^{n}|\theta_j|
\]

特点：

- 能把部分参数压到 0。
- 可用于特征选择。
- 在 0 处不可导，优化比 L2 更复杂。

### 5.4 正则化参数 \(\lambda\)

| \(\lambda\) | 结果 |
| --- | --- |
| 太小 | 约束弱，仍可能过拟合 |
| 合适 | 降低方差，提高泛化 |
| 太大 | 参数过小，模型欠拟合 |

### 5.5 实验代码：正则化与模型选择

??? example "Code"
    ```python
    import numpy as np
    from sklearn.datasets import make_regression
    from sklearn.linear_model import Ridge
    from sklearn.model_selection import GridSearchCV, train_test_split
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler, PolynomialFeatures
    from sklearn.metrics import mean_squared_error

    X, y = make_regression(
        n_samples=200,
        n_features=1,
        noise=20,
        random_state=42
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipe = Pipeline([
        ("poly", PolynomialFeatures(include_bias=False)),
        ("scaler", StandardScaler()),
        ("model", Ridge())
    ])

    param_grid = {
        "poly__degree": [1, 2, 3, 5, 8],
        "model__alpha": [0.01, 0.1, 1, 10, 100]
    }

    search = GridSearchCV(
        pipe,
        param_grid=param_grid,
        scoring="neg_root_mean_squared_error",
        cv=5
    )

    search.fit(X_train, y_train)
    best_model = search.best_estimator_
    y_pred = best_model.predict(X_test)

    print("best params:", search.best_params_)
    print("test RMSE:", mean_squared_error(y_test, y_pred, squared=False))
    ```

## 六、决策树

### 6.1 基本思想

决策树通过一系列特征测试把样本划分到叶节点。

```text
是否有纹理?
  |-- 是: 是否根蒂蜷缩?
  |       |-- 是: 好瓜
  |       |-- 否: 坏瓜
  |
  |-- 否: 坏瓜
```

优点：

- 可解释性强。
- 可处理离散和连续特征。
- 对特征缩放不敏感。

缺点：

- 容易过拟合。
- 单棵树不稳定，数据小变化可能导致结构大变化。

### 6.2 信息熵

数据集 \(D\) 的类别比例为 \(p_k\)：

\[
Ent(D)=-\sum_{k=1}^{K}p_k\log_2 p_k
\]

熵越大，类别越混乱；熵越小，类别越纯。

### 6.3 信息增益

用属性 \(a\) 划分数据集：

\[
Gain(D,a)=Ent(D)-\sum_{v=1}^{V}\frac{|D^v|}{|D|}Ent(D^v)
\]

ID3 选择信息增益最大的属性。

### 6.4 增益率与基尼指数

信息增益偏好取值多的属性，C4.5 使用增益率：

\[
Gain\_ratio(D,a)=\frac{Gain(D,a)}{IV(a)}
\]

其中：

\[
IV(a)=-\sum_{v=1}^{V}\frac{|D^v|}{|D|}\log_2\frac{|D^v|}{|D|}
\]

CART 常用基尼指数：

\[
Gini(D)=1-\sum_{k=1}^{K}p_k^2
\]

属性划分后的基尼指数：

\[
Gini\_index(D,a)=\sum_{v=1}^{V}\frac{|D^v|}{|D|}Gini(D^v)
\]

CART 选择 \(Gini\_index\) 最小的划分。

### 6.5 剪枝

| 方法 | 思路 |
| --- | --- |
| 预剪枝 | 建树过程中提前停止，如限制最大深度、最小样本数 |
| 后剪枝 | 先生成完整树，再自底向上剪掉不提升验证效果的子树 |

### 6.6 实验代码：决策树分类

??? example "Code"
    ```python
    from sklearn.datasets import load_breast_cancer
    from sklearn.model_selection import train_test_split
    from sklearn.tree import DecisionTreeClassifier
    from sklearn.metrics import classification_report

    data = load_breast_cancer()
    X_train, X_test, y_train, y_test = train_test_split(
        data.data,
        data.target,
        test_size=0.2,
        random_state=42,
        stratify=data.target
    )

    clf = DecisionTreeClassifier(
        max_depth=4,
        min_samples_leaf=5,
        random_state=42
    )
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)

    print(classification_report(y_test, y_pred, target_names=data.target_names))
    ```

## 七、贝叶斯分类

### 7.1 贝叶斯公式

\[
P(c|x)=\frac{P(c)P(x|c)}{P(x)}
\]

分类时比较各类别后验概率：

\[
h(x)=\arg\max_c P(c|x)
\]

由于 \(P(x)\) 对所有类别相同，可写为：

\[
h(x)=\arg\max_c P(c)P(x|c)
\]

### 7.2 朴素贝叶斯

朴素假设：给定类别后，各特征条件独立。

\[
P(x|c)=\prod_{j=1}^{n}P(x_j|c)
\]

因此：

\[
h(x)=\arg\max_c P(c)\prod_{j=1}^{n}P(x_j|c)
\]

为了避免下溢，实际常取对数：

\[
h(x)=\arg\max_c \left[\log P(c)+\sum_{j=1}^{n}\log P(x_j|c)\right]
\]

### 7.3 拉普拉斯平滑

若某特征值在训练集中从未与某类别同时出现，概率会变成 0。拉普拉斯平滑：

\[
P(x_j=a|c)=\frac{N_{c,a}+1}{N_c+K}
\]

其中 \(K\) 是该特征可能取值数。

### 7.4 实验代码：文本分类

??? example "Code"
    ```python
    from sklearn.datasets import fetch_20newsgroups
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.pipeline import Pipeline
    from sklearn.metrics import classification_report

    categories = ["sci.space", "rec.sport.baseball", "comp.graphics"]
    train = fetch_20newsgroups(subset="train", categories=categories, remove=("headers", "footers", "quotes"))
    test = fetch_20newsgroups(subset="test", categories=categories, remove=("headers", "footers", "quotes"))

    model = Pipeline([
        ("tfidf", TfidfVectorizer(stop_words="english", min_df=2)),
        ("clf", MultinomialNB())
    ])

    model.fit(train.data, train.target)
    pred = model.predict(test.data)

    print(classification_report(test.target, pred, target_names=train.target_names))
    ```

## 八、支持向量机

### 8.1 最大间隔思想

SVM 希望找到能分开两类样本且间隔最大的超平面。

超平面：

\[
w^Tx+b=0
\]

函数间隔约束：

\[
y_i(w^Tx_i+b)\ge 1
\]

几何间隔最大化等价于最小化：

\[
\min_{w,b}\frac{1}{2}\|w\|^2
\]

### 8.2 软间隔

允许少量样本违反间隔，引入松弛变量 \(\xi_i\)：

\[
\min_{w,b,\xi}
\frac{1}{2}\|w\|^2+C\sum_{i=1}^{m}\xi_i
\]

约束：

\[
y_i(w^Tx_i+b)\ge 1-\xi_i,\quad \xi_i\ge 0
\]

| 参数 | 含义 |
| --- | --- |
| \(C\) 大 | 更重视训练集分类正确，可能过拟合 |
| \(C\) 小 | 更重视大间隔，容忍更多错误 |

### 8.3 核函数

核技巧用内积函数隐式映射到高维空间。

常见核：

| 核函数 | 形式 | 适用 |
| --- | --- | --- |
| 线性核 | \(K(x,z)=x^Tz\) | 高维稀疏、线性可分 |
| 多项式核 | \(K(x,z)=(x^Tz+c)^d\) | 多项式边界 |
| RBF 核 | \(K(x,z)=\exp(-\gamma\|x-z\|^2)\) | 非线性边界 |

### 8.4 实验代码：SVM 分类

??? example "Code"
    ```python
    from sklearn.datasets import load_breast_cancer
    from sklearn.model_selection import GridSearchCV, train_test_split
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.svm import SVC
    from sklearn.metrics import classification_report

    data = load_breast_cancer()
    X_train, X_test, y_train, y_test = train_test_split(
        data.data,
        data.target,
        test_size=0.2,
        random_state=42,
        stratify=data.target
    )

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("svc", SVC())
    ])

    param_grid = {
        "svc__kernel": ["linear", "rbf"],
        "svc__C": [0.1, 1, 10],
        "svc__gamma": ["scale", 0.01, 0.1]
    }

    search = GridSearchCV(pipe, param_grid, cv=5, scoring="f1")
    search.fit(X_train, y_train)

    pred = search.predict(X_test)
    print("best params:", search.best_params_)
    print(classification_report(y_test, pred))
    ```

## 九、集成学习

### 9.1 基本思想

集成学习把多个弱学习器组合成更强模型。

| 方法 | 思想 | 代表算法 |
| --- | --- | --- |
| Bagging | 并行训练多个模型，降低方差 | Random Forest |
| Boosting | 串行关注错分样本，降低偏差 | AdaBoost、GBDT、XGBoost |
| Stacking | 多模型输出再训练元模型 | Stacking |

### 9.2 随机森林

随机森林 = Bootstrap 采样 + 决策树 + 特征随机选择。

优点：

- 相比单棵树更稳定。
- 不易过拟合。
- 可估计特征重要性。

### 9.3 Boosting

Boosting 逐轮训练模型，每一轮更关注前面模型表现不好的样本。

```text
Model 1 -> errors
Model 2 focuses on errors -> errors
Model 3 focuses on remaining errors
Final prediction = weighted combination
```

### 9.4 实验代码：随机森林

??? example "Code"
    ```python
    from sklearn.datasets import load_wine
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score

    data = load_wine()
    X_train, X_test, y_train, y_test = train_test_split(
        data.data,
        data.target,
        test_size=0.2,
        random_state=42,
        stratify=data.target
    )

    forest = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_leaf=2,
        random_state=42
    )
    forest.fit(X_train, y_train)
    pred = forest.predict(X_test)

    print("accuracy:", accuracy_score(y_test, pred))

    importance = sorted(
        zip(data.feature_names, forest.feature_importances_),
        key=lambda item: item[1],
        reverse=True
    )
    print("top features:", importance[:5])
    ```

## 十、聚类

### 10.1 聚类任务

聚类在无标签数据中发现相似样本群组。

应用：

- 用户分群。
- 文档主题发现。
- 图像分割。
- 异常检测前处理。

### 10.2 K-Means

目标函数：

\[
\min_{\{C_k\},\{\mu_k\}}
\sum_{k=1}^{K}\sum_{x_i\in C_k}\|x_i-\mu_k\|^2
\]

算法步骤：

```text
1. 随机初始化 K 个中心
2. 将每个样本分配给最近中心
3. 重新计算每个簇的均值作为新中心
4. 重复 2-3，直到中心基本不变
```

优点：

- 简单、高效。
- 适合球状簇。

缺点：

- 需要预先给定 \(K\)。
- 对初始中心敏感。
- 对异常值敏感。
- 不适合非凸形状簇。

### 10.3 选择 K

肘部法则：

```text
K 增大时，簇内平方和下降。
下降速度突然变慢的位置可作为候选 K。
```

轮廓系数：

\[
s(i)=\frac{b(i)-a(i)}{\max(a(i),b(i))}
\]

其中：

- \(a(i)\)：样本到同簇其他样本的平均距离。
- \(b(i)\)：样本到最近其他簇样本的平均距离。

### 10.4 实验代码：K-Means 用户分群

??? example "Code"
    ```python
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    from sklearn.preprocessing import StandardScaler

    X = np.array([
        [1000, 5], [1200, 6], [900, 4],
        [5000, 20], [5500, 22], [4800, 18],
        [8000, 5], [8500, 4], [7800, 6]
    ], dtype=float)

    X_scaled = StandardScaler().fit_transform(X)

    scores = []
    for k in range(2, 6):
        labels = KMeans(n_clusters=k, random_state=42, n_init="auto").fit_predict(X_scaled)
        scores.append((k, silhouette_score(X_scaled, labels)))

    best_k = max(scores, key=lambda item: item[1])[0]
    kmeans = KMeans(n_clusters=best_k, random_state=42, n_init="auto")
    labels = kmeans.fit_predict(X_scaled)

    print("silhouette scores:", scores)
    print("best k:", best_k)

    plt.scatter(X[:, 0], X[:, 1], c=labels)
    plt.xlabel("monthly spending")
    plt.ylabel("monthly visits")
    plt.title("K-Means Customer Segmentation")
    plt.show()
    ```

## 十一、降维与 PCA

### 11.1 为什么降维

降维目标：

- 可视化高维数据。
- 减少噪声。
- 降低计算成本。
- 缓解维度灾难。
- 去除冗余相关特征。

### 11.2 PCA 基本思想

PCA 寻找方差最大的正交方向，把数据投影到这些方向上。

步骤：

```text
1. 数据中心化
2. 计算协方差矩阵
3. 求特征值和特征向量
4. 选择最大特征值对应的前 k 个主成分
5. 投影到低维空间
```

协方差矩阵：

\[
\Sigma=\frac{1}{m}X^TX
\]

投影：

\[
Z = XW_k
\]

解释方差比：

\[
Explained\ Variance\ Ratio_i
=\frac{\lambda_i}{\sum_j\lambda_j}
\]

### 11.3 PCA 注意事项

- PCA 是无监督方法，不使用标签。
- PCA 前通常要标准化。
- PCA 主成分不一定具有原始业务含义。
- 降维可能损失信息，应看累计解释方差。

### 11.4 实验代码：PCA 可视化

??? example "Code"
    ```python
    import matplotlib.pyplot as plt
    from sklearn.datasets import load_iris
    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler

    iris = load_iris()
    X_scaled = StandardScaler().fit_transform(iris.data)

    pca = PCA(n_components=2)
    X_2d = pca.fit_transform(X_scaled)

    print("explained variance ratio:", pca.explained_variance_ratio_)

    plt.scatter(X_2d[:, 0], X_2d[:, 1], c=iris.target)
    plt.xlabel("PC1")
    plt.ylabel("PC2")
    plt.title("PCA on Iris")
    plt.show()
    ```

## 十二、异常检测

### 12.1 异常检测任务

异常检测识别与大多数样本明显不同的数据。

应用：

- 信用卡欺诈。
- 设备故障监测。
- 网络入侵。
- 质量检测。

### 12.2 高斯异常检测

假设特征服从高斯分布：

\[
p(x;\mu,\sigma^2)=
\frac{1}{\sqrt{2\pi}\sigma}
\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)
\]

多特征独立假设下：

\[
p(x)=\prod_{j=1}^{n}p(x_j;\mu_j,\sigma_j^2)
\]

判定规则：

\[
p(x)<\epsilon \Rightarrow anomaly
\]

### 12.3 阈值选择

用验证集选择 \(\epsilon\)，常看 F1：

\[
F1=\frac{2PR}{P+R}
\]

其中 \(P\) 是 precision，\(R\) 是 recall。

### 12.4 实验代码：Isolation Forest

??? example "Code"
    ```python
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.ensemble import IsolationForest

    rng = np.random.RandomState(42)
    normal = 0.3 * rng.randn(100, 2)
    normal = np.r_[normal + 2, normal - 2]
    outliers = rng.uniform(low=-4, high=4, size=(20, 2))
    X = np.r_[normal, outliers]

    model = IsolationForest(contamination=0.1, random_state=42)
    pred = model.fit_predict(X)

    plt.scatter(X[:, 0], X[:, 1], c=pred)
    plt.title("Isolation Forest Anomaly Detection")
    plt.show()
    ```

## 十三、推荐系统基础

### 13.1 推荐问题

推荐系统目标是预测用户对物品的偏好。

常见数据：

```text
user_id, item_id, rating
```

或隐式反馈：

```text
click, view, purchase, dwell time
```

### 13.2 协同过滤

| 方法 | 思路 |
| --- | --- |
| User-based CF | 找相似用户，推荐他们喜欢的物品 |
| Item-based CF | 找相似物品，推荐用户喜欢物品的相似物 |
| Matrix Factorization | 将用户和物品映射到隐向量空间 |

矩阵分解预测：

\[
\hat{r}_{ui}=p_u^Tq_i
\]

损失函数：

\[
J=\sum_{(u,i)\in \Omega}(r_{ui}-p_u^Tq_i)^2
+\lambda\left(\sum_u\|p_u\|^2+\sum_i\|q_i\|^2\right)
\]

### 13.3 冷启动问题

| 冷启动对象 | 解决思路 |
| --- | --- |
| 新用户 | 引导选择兴趣、使用热门推荐、利用人口统计特征 |
| 新物品 | 内容特征、人工标签、探索流量 |
| 新系统 | 内容推荐、规则推荐、外部数据 |

## 十四、神经网络入门

### 14.1 神经元

单个神经元：

\[
z=w^Tx+b
\]

\[
a=g(z)
\]

常见激活函数：

| 激活函数 | 公式 | 特点 |
| --- | --- | --- |
| Sigmoid | \(\frac{1}{1+e^{-z}}\) | 输出 0 到 1，深层网络易梯度消失 |
| Tanh | \(\tanh(z)\) | 输出 -1 到 1 |
| ReLU | \(\max(0,z)\) | 训练快，常用 |

### 14.2 前向传播

一层网络：

\[
Z^{[l]}=W^{[l]}A^{[l-1]}+b^{[l]}
\]

\[
A^{[l]}=g(Z^{[l]})
\]

输出层根据任务选择：

| 任务 | 输出层 | 损失 |
| --- | --- | --- |
| 二分类 | Sigmoid | Binary Cross Entropy |
| 多分类 | Softmax | Cross Entropy |
| 回归 | Linear | MSE |

### 14.3 反向传播直觉

反向传播用链式法则计算每层参数对损失的梯度。

```text
loss
  -> output layer gradient
  -> hidden layer gradient
  -> update W, b
```

神经网络在本笔记中只做机器学习主线补充，深度学习可放到单独笔记继续展开。

## 十五、实验工作流模板

### 15.1 通用 sklearn Pipeline

??? example "Code"
    ```python
    from sklearn.datasets import load_breast_cancer
    from sklearn.model_selection import train_test_split, GridSearchCV
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import classification_report, confusion_matrix

    data = load_breast_cancer()
    X_train, X_test, y_train, y_test = train_test_split(
        data.data,
        data.target,
        test_size=0.2,
        random_state=42,
        stratify=data.target
    )

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("model", LogisticRegression(max_iter=2000))
    ])

    param_grid = {
        "model__C": [0.01, 0.1, 1, 10],
        "model__penalty": ["l2"]
    }

    search = GridSearchCV(
        pipe,
        param_grid=param_grid,
        cv=5,
        scoring="f1"
    )

    search.fit(X_train, y_train)
    y_pred = search.predict(X_test)

    print("best params:", search.best_params_)
    print(confusion_matrix(y_test, y_pred))
    print(classification_report(y_test, y_pred, target_names=data.target_names))
    ```

### 15.2 防止数据泄漏

错误做法：

```python
# 错误：在划分数据前对全量数据 fit_transform
X_scaled = scaler.fit_transform(X)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)
```

正确做法：

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

更推荐用 `Pipeline`，让交叉验证内部自动只在训练折上拟合预处理器。

### 15.3 保存和加载模型

```python
import joblib

joblib.dump(search.best_estimator_, "machine_learning_model.joblib")

loaded_model = joblib.load("machine_learning_model.joblib")
predictions = loaded_model.predict(X_test)
```

### 15.4 实验报告应包含

| 部分 | 内容 |
| --- | --- |
| 任务定义 | 输入、输出、学习类型、业务目标 |
| 数据说明 | 样本数、特征、标签、缺失值、类别分布 |
| 预处理 | 标准化、编码、缺失值处理、特征构造 |
| 模型选择 | 候选模型、超参数范围 |
| 评估指标 | 为什么选择该指标 |
| 实验结果 | 验证集和测试集表现 |
| 错误分析 | 哪些样本错、为什么错 |
| 改进方向 | 数据、特征、模型、调参 |

## 十六、高频易错点

| 知识点 | 易错说法 | 正确理解 |
| --- | --- | --- |
| 训练误差 | 越低越好 | 训练误差太低而验证误差高是过拟合 |
| 测试集 | 可以反复调参使用 | 测试集应只用于最终评估 |
| 标准化 | 对所有模型都无所谓 | 梯度模型、SVM、KNN、PCA 通常需要 |
| 逻辑回归 | 是回归算法 | 名字带回归，但常用于分类 |
| Sigmoid 输出 | 一定是校准良好的概率 | 可解释为概率，但校准未必好 |
| 正则化 | \(\lambda\) 越大越好 | 太大会欠拟合 |
| 决策树 | 深度越深越准 | 深树容易过拟合 |
| K-Means | 能发现任意形状簇 | 更适合球状、规模相近的簇 |
| PCA | 会保留最有用的分类信息 | PCA 不看标签，只保留方差大方向 |
| SVM 核函数 | RBF 一定最好 | 取决于数据规模、特征和调参 |
| 准确率 | 分类任务都看 accuracy | 类别不平衡时 accuracy 可能误导 |
| 特征工程 | 可以在全数据上做 | 会数据泄漏，应只在训练数据上 fit |

## 十七、公式速查

| 内容 | 公式 |
| --- | --- |
| 线性回归 | \(h_\theta(x)=\theta^Tx\) |
| 线性回归 MSE | \(J(\theta)=\frac{1}{2m}\sum_i(h_\theta(x^{(i)})-y^{(i)})^2\) |
| 梯度下降 | \(\theta:=\theta-\alpha\nabla_\theta J(\theta)\) |
| 正规方程 | \(\theta=(X^TX)^{-1}X^Ty\) |
| Sigmoid | \(g(z)=\frac{1}{1+e^{-z}}\) |
| 逻辑回归 | \(h_\theta(x)=g(\theta^Tx)\) |
| 交叉熵 | \(-\frac{1}{m}\sum_i[y^{(i)}\log h_i+(1-y^{(i)})\log(1-h_i)]\) |
| L2 正则 | \(J_{reg}=J+\frac{\lambda}{2m}\sum_{j=1}^{n}\theta_j^2\) |
| 精确率 | \(Precision=\frac{TP}{TP+FP}\) |
| 召回率 | \(Recall=\frac{TP}{TP+FN}\) |
| F1 | \(F1=\frac{2PR}{P+R}\) |
| 熵 | \(Ent(D)=-\sum_kp_k\log_2p_k\) |
| 信息增益 | \(Gain(D,a)=Ent(D)-\sum_v\frac{|D^v|}{|D|}Ent(D^v)\) |
| 基尼指数 | \(Gini(D)=1-\sum_kp_k^2\) |
| SVM 软间隔 | \(\min\frac{1}{2}\|w\|^2+C\sum_i\xi_i\) |
| PCA 协方差 | \(\Sigma=\frac{1}{m}X^TX\) |
| 高斯分布 | \(p(x;\mu,\sigma^2)=\frac{1}{\sqrt{2\pi}\sigma}e^{-\frac{(x-\mu)^2}{2\sigma^2}}\) |

## 十八、复习路线

### 第一轮：打基础

1. 机器学习定义、任务分类、基本流程。
2. 训练/验证/测试集，交叉验证。
3. 回归和分类指标。
4. 偏差、方差、过拟合、欠拟合。

### 第二轮：掌握核心监督学习

1. 线性回归：代价函数、梯度下降、正规方程。
2. 逻辑回归：Sigmoid、交叉熵、决策边界。
3. 正则化：L1、L2、\(\lambda\) 的作用。
4. 决策树：熵、信息增益、基尼指数、剪枝。
5. SVM：最大间隔、软间隔、核函数。

### 第三轮：掌握无监督与模型组合

1. K-Means：目标函数、算法步骤、K 的选择。
2. PCA：主成分、解释方差、降维流程。
3. 异常检测：概率密度、阈值选择。
4. 集成学习：Bagging、Boosting、随机森林。

### 第四轮：做实验

1. 用 `Pipeline` 防止数据泄漏。
2. 用 `GridSearchCV` 做超参数搜索。
3. 写清楚实验指标和数据划分。
4. 做错误分析，而不是只报告一个分数。
5. 保存模型并记录依赖版本。

## 十九、参考资料

- 周志华：《机器学习》。
- Peter Harrington：《机器学习实战》。
- Andrew Ng：《Machine Learning》课程视频，用于参考监督学习、梯度下降、正则化、神经网络、模型评估等课程主线。
