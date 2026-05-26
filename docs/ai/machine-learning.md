# 一、机器学习概述

### 1. 机器学习定义

Arthur Samuel：在没有明确编程的情况下，让计算机具备学习能力

Tom Mitchell：一个程序被认为能从经验 E 中学习，解决任务 T，达到性能度量值 P，当且仅当有了经验 E 后，经过 P 评判，程序在处理 T 时的性能有所提升。

### 2. 机器学习核心分类

#### （1）监督学习（Supervised Learning）

- **核心特点**：训练数据带有**标签（正确答案）**，算法学习输入到输出的映射关系
- **核心目标**：对新的未知数据进行预测
- **主要分类**
    
    1. **回归问题**：预测连续型数值（如房价预测、气温预测）
    2. **分类问题**：预测离散型类别（如肿瘤良性 / 恶性、垃圾邮件分类）
    
- **典型应用**：房价预测、人脸识别、信用评分

#### （2）无监督学习（Unsupervised Learning）

- **核心特点**：训练数据**无标签**，算法自动发现数据内在结构与规律
- **核心目标**：对数据进行分组、降维、异常检测
- **主要算法 / 场景**
    
    1. **聚类**：将相似数据归为一类（K-Means）
    2. **降维**：减少数据特征同时保留主要信息（PCA 主成分分析）
    3. **异常检测**：识别数据中的离群点
    
- **典型应用**：用户分群、新闻聚类、基因序列分析

# 二、线性回归（Linear Regression）

## 1. 适用场景

监督学习中的**回归问题**，预测连续输出值，是最基础的回归模型

## 2. 一元线性回归

### （1） 单变量线性回归预测函数

- **假设函数（Hypothesis Function）** \(h_{θ}​(x)=θ_{0}​+θ_{1}​x\)
    - \(h_{θ}​(x)\)：模型预测值
    - \(θ_{0}\)​：截距项（偏置项）
    - \(θ_{1}\)​：斜率项（特征权重）
    - x：输入特征

### （2） 单变量线性回归成本函数（均方误差 MSE）

\[J(\theta_0, \theta_1) = \frac{1}{2m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right)^2\]

- m：训练样本数量
- x(i)：第i个样本的输入
- y(i)：第i个样本的真实标签
- 乘以21​：为了后续求导时抵消系数，简化计算

成本函数特性

- 凸函数：只有全局最优解，无局部最优解
- 图像形态：单变量时为碗状三维曲面，多变量为高维凸函数

### （3）梯度下降算法（Gradient Descent）

#### 1. 算法核心思想

沿着成本函数的**负梯度方向**迭代更新参数，逐步逼近成本函数最小值

#### 2. 核心公式

**同步更新参数**（关键：必须同时计算所有参数的新值，再统一更新）

\[\theta_j := \theta_j - \alpha \frac{\partial}{\partial \theta_j} J(\theta)\]

- :=：赋值符号
- α：学习率（步长），控制每次迭代的更新幅度

#### 3. 单变量线性回归梯度下降推导结果

\[\theta_0 := \theta_0 - \alpha \frac{1}{m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right)\]

\[\theta_1 := \theta_1 - \alpha \frac{1}{m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right) \cdot x^{(i)}\]

#### 4. 学习率α的关键要点

- α过小：收敛速度极慢，迭代次数过多
- α过大：无法收敛，甚至出现成本函数上升、梯度爆炸
- 调试技巧：绘制成本函数随迭代次数的变化曲线，观察收敛情况

## 3.多元线性回归
多元线性回归是单变量版本的通用化拓展，适配多特征场景，是实际建模中梯度下降的常用形态，核心逻辑和单变量一致，仅参数维度和梯度计算拓展至n个特征，公式推导更依赖向量化简化计算，避免繁琐的循环运算。

### （1）假设函数

\[h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 x_2 + \dots + \theta_n x_n\]

- \(h_\theta(x) = \theta^T x\)
- \(\theta = [\theta_0, \theta_1, \theta_2, \dots, \theta_n]^T\)：参数向量（n+1维）
- \(x = [1, x_1, x_2, \dots, x_n]^T\)：特征向量


### （2） 多元线性回归成本函数

依旧沿用均方误差成本函数，只是变量拓展至n个参数，形式和单变量一致，本质都是衡量整体预测误差：

\[J(\theta) = \frac{1}{2m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right)^2\]


### （3） 多元梯度下降

**黄金规则：所有参数必须同步更新**，先一次性计算出所有\(\theta_0\)到\(\theta_n\)的临时新值，再统一赋值覆盖旧参数，绝对不能逐个更新。

\[\theta_j := \theta_j - \alpha \frac{1}{m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right) \cdot x_j^{(i)} \quad (j = 0,1,2,...,n)\]


当\(j=0\)时，\(x_0^{(i)}=1\)，梯度公式退化为单变量的\(\theta_0\)更新式，和之前内容完全统一：\(\theta_0 := \theta_0 - \alpha \frac{1}{m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right)\)
### （4）特征缩放（Feature Scaling）
梯度下降前置优化步骤，加速收敛：

- 目的：统一不同特征的取值范围，避免因特征量级差异过大导致收敛缓慢
    
- 常用方法：标准化\(x = \frac{x-\mu}{\sigma}\)、归一化（缩放到0-1区间）


# 三、逻辑回归（Logistic Regression）
## 1. 适用场景
监督学习中的**分类问题**，核心适配二分类任务（如肿瘤良恶性判断、垃圾邮件识别），也可通过One-vs-Rest等策略拓展为多分类模型。

## 2. 核心原理
逻辑回归以线性回归为基础，通过**Sigmoid激活函数**将线性模型的连续输出映射至(0,1)区间，输出值可解释为样本属于正类的概率，最终基于概率阈值完成分类。

## 3. 假设函数
### （1）线性预测部分
先通过线性模型计算连续输出值：

\[z = \theta^T x = \theta_0 + \theta_1 x_1 + \theta_2 x_2 + \dots + \theta_n x_n\]

### （2）Sigmoid激活函数
将线性输出z映射到(0,1)区间，得到概率形式的预测结果：

\[h_\theta(x) = g(z) = \frac{1}{1 + e^{-z}}\]

- \(h_\theta(x)\)：样本属于正类的概率，当\(h_\theta(x) \geq 0.5\)时判定为正类，反之判定为负类
- Sigmoid函数特性：呈S型曲线，在z=0处斜率最大；当z→+∞时h→1，z→-∞时h→0

## 4. 成本函数（交叉熵损失）
若直接使用线性回归的均方误差（MSE）作为成本函数，会因Sigmoid的非线性导致成本函数为**非凸函数**，存在多个局部最优解，因此采用交叉熵损失函数：
### （1）单样本成本

\[
Cost(h_\theta(x), y) =
\begin{cases}
-\log(h_\theta(x)) & \text{当 } y=1 \\
-\log(1 - h_\theta(x)) & \text{当 } y=0
\end{cases}
\]

- 当y=1时，预测概率越接近1，成本越趋近于0；越接近0，成本趋近于+∞
- 当y=0时，预测概率越接近0，成本越趋近于0；越接近1，成本趋近于+∞

### （2）整体成本函数
对m个训练样本的成本取平均值：

\[J(\theta) = \frac{1}{m} \sum_{i=1}^m Cost(h_\theta(x^{(i)}), y^{(i)}) = -\frac{1}{m} \left[ \sum_{i=1}^m y^{(i)}\log(h_\theta(x^{(i)})) + (1-y^{(i)})\log(1-h_\theta(x^{(i)})) \right]\]

- 交叉熵损失为**凸函数**，仅存在全局最优解，可通过梯度下降稳定收敛到最优参数

## 5. 梯度下降优化
对交叉熵损失函数求导后，参数更新公式形式与线性回归完全一致，但\(h_\theta(x)\)的定义不同：

\[\theta_j := \theta_j - \alpha \frac{1}{m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right) \cdot x_j^{(i)} \quad (j=0,1,...,n)\]

- 注意：逻辑回归中\(h_\theta(x)\)是Sigmoid激活后的概率输出，线性回归中是纯线性输出

## 6. 决策边界
决策边界是区分不同类别的边界线/面，由\(h_\theta(x)=0.5\)推导而来（此时\(z=\theta^T x=0\)）：
### （1）线性决策边界
当模型使用原始特征时，决策边界为线性方程：

\[\theta_0 + \theta_1 x_1 + \theta_2 x_2 + ... + \theta_n x_n = 0\]

- 示例：二特征二分类任务中，决策边界为一条直线，可将二维平面划分为两个类别区域

### （2）非线性决策边界
通过引入**多项式特征**（如\(x_1^2、x_1x_2、x_2^2\)等），可构建非线性决策边界（如圆形、椭圆形）：
- 示例：若假设函数为\(h_\theta(x) = g(\theta_0 + \theta_1 x_1 + \theta_2 x_2 + \theta_3 x_1^2 + \theta_4 x_2^2)\)，则决策边界为\(\theta_0 + \theta_1 x_1 + \theta_2 x_2 + \theta_3 x_1^2 + \theta_4 x_2^2 = 0\)，对应圆形或椭圆形边界

---

# 四、过拟合与正则化
## 1. 过拟合问题
### （1）定义
模型在**训练集上表现极佳**，但在**测试集/未知新数据上表现极差**，本质是模型过度拟合训练数据中的噪声和局部细节，无法学习到数据的通用规律，泛化能力弱。

### （2）典型表现
- 训练集误差极低，测试集误差显著高于训练集误差
- 模型复杂度远高于数据真实规律（如用高次多项式拟合简单线性分布的数据）

### （3）常见原因
- 模型复杂度过高（如特征数量过多、多项式次数过高）
- 训练数据量过少或数据中存在大量噪声

## 2. 正则化（Regularization）
正则化通过在成本函数中添加**参数惩罚项**，限制模型参数的取值大小，从而降低模型复杂度，有效缓解过拟合。

### （1）L2正则化（岭回归/权重衰减）
在成本函数中添加参数的平方和作为惩罚项，核心是让所有参数尽可能小，但不会趋近于0：
##### 线性回归的L2正则化成本函数

\[J(\theta) = \frac{1}{2m} \left[ \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right)^2 + \lambda \sum_{j=1}^n \theta_j^2 \right]\]

##### 逻辑回归的L2正则化成本函数

\[J(\theta) = -\frac{1}{m} \left[ \sum_{i=1}^m y^{(i)}\log(h_\theta(x^{(i)})) + (1-y^{(i)})\log(1-h_\theta(x^{(i)})) \right] + \frac{\lambda}{2m} \sum_{j=1}^n \theta_j^2\]

- \(\lambda\)：正则化参数，控制惩罚力度
  - \(\lambda\)过小：惩罚力度不足，无法有效缓解过拟合
  - \(\lambda\)过大：惩罚力度过强，模型会过度简化，导致欠拟合（训练集和测试集误差都很高）
- 注意：截距项\(\theta_0\)通常不参与正则化，因为它仅影响模型的整体偏移，不决定模型复杂度

##### L2正则化的梯度下降更新
参数更新公式需加入惩罚项的梯度：

\[\theta_0 := \theta_0 - \alpha \frac{1}{m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right) \cdot x_0^{(i)}\]

\[\theta_j := \theta_j - \alpha \left[ \frac{1}{m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right) \cdot x_j^{(i)} + \frac{\lambda}{m} \theta_j \right] \quad (j=1,...,n)\]

- 可改写为：\(\theta_j := \theta_j\left(1 - \alpha \frac{\lambda}{m}\right) - \alpha \frac{1}{m} \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right) \cdot x_j^{(i)}\)，其中\(\left(1 - \alpha \frac{\lambda}{m}\right)\)会让参数每次迭代都略有缩小，即"权重衰减"

### （2）L1正则化（Lasso回归）
在成本函数中添加参数的绝对值和作为惩罚项，核心是将不重要的参数压缩至0，实现**自动特征选择**：
##### 线性回归的L1正则化成本函数

\[J(\theta) = \frac{1}{2m} \left[ \sum_{i=1}^m \left(h_\theta(x^{(i)}) - y^{(i)}\right)^2 + \lambda \sum_{j=1}^n |\theta_j| \right]\]

- 特点：可将部分特征的参数置为0，相当于自动剔除不重要的特征，适合高维特征场景
- 注意：绝对值函数在0处不可导，需使用次梯度下降等特殊优化算法

## 3. 其他缓解过拟合的方法
- 增加训练数据量：让模型学习到更通用的数据规律，减少噪声的影响
- 特征选择：手动筛选核心特征，或使用方差选择、互信息等算法自动选择特征
- 早停法（Early Stopping）：在梯度下降迭代过程中，当验证集误差不再下降时提前停止训练，避免过度拟合训练数据
- 
---

# 代码示例
## 一、机器学习概述

### 1.监督学习：线性回归预测示例
```python
import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

# 生成模拟房价数据：面积（平方米）→ 房价（万元）
X = np.array([50, 60, 70, 80, 90, 100]).reshape(-1, 1)  # 输入特征（面积）
y = np.array([120, 140, 165, 190, 215, 240])  # 真实房价

# 训练线性回归模型
model = LinearRegression()
model.fit(X, y)

# 预测新数据
new_area = np.array([110]).reshape(-1, 1)
predicted_price = model.predict(new_area)
print(f"面积110㎡的房价预测值：{predicted_price[0]:.2f}万元")

# 可视化结果
plt.scatter(X, y, color='blue', label='真实数据')
plt.plot(X, model.predict(X), color='red', label='拟合直线')
plt.scatter(new_area, predicted_price, color='green', marker='*', s=200, label='预测值')
plt.xlabel('房屋面积(㎡)')
plt.ylabel('房价(万元)')
plt.legend()
plt.show()
```

### 2.无监督学习：K-Means用户聚类示例
```python
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

# 生成模拟用户数据：消费金额（元）+ 每月消费次数
X = np.array([
    [1000, 5], [1200, 6], [900, 4], [5000, 20], [5500, 22],
    [4800, 18], [8000, 5], [8500, 4], [7800, 6]
])

# 训练K-Means聚类模型（分为3类：低消费、高频高消费、低频高消费）
kmeans = KMeans(n_clusters=3, random_state=42)
labels = kmeans.fit_predict(X)

# 可视化聚类结果
plt.scatter(X[labels==0, 0], X[labels==0, 1], color='red', label='低消费用户')
plt.scatter(X[labels==1, 0], X[labels==1, 1], color='blue', label='高频高消费用户')
plt.scatter(X[labels==2, 0], X[labels==2, 1], color='green', label='低频高消费用户')
plt.scatter(kmeans.cluster_centers_[:,0], kmeans.cluster_centers_[:,1], color='black', marker='X', s=300, label='聚类中心')
plt.xlabel('每月消费金额(元)')
plt.ylabel('每月消费次数')
plt.legend()
plt.show()
```

---

## 二、线性回归
### 1. 一元线性回归：手动实现梯度下降
```python
import numpy as np
import matplotlib.pyplot as plt

# 生成模拟数据
X = np.array([50, 60, 70, 80, 90, 100])
y = np.array([120, 140, 165, 190, 215, 240])
m = len(X)  # 样本数量

# 初始化参数
theta0 = 0
theta1 = 0
learning_rate = 0.0001
epochs = 100000
cost_history = []

# 梯度下降迭代
for i in range(epochs):
    # 计算预测值
    h = theta0 + theta1 * X
    # 计算成本函数（MSE）
    cost = (1/(2*m)) * np.sum((h - y)**2)
    cost_history.append(cost)
    # 计算梯度
    grad0 = (1/m) * np.sum(h - y)
    grad1 = (1/m) * np.sum((h - y) * X)
    # 同步更新参数
    theta0 -= learning_rate * grad0
    theta1 -= learning_rate * grad1
    # 每10000轮打印一次结果
    if i % 10000 == 0:
        print(f"迭代轮次 {i}: 成本={cost:.4f}, theta0={theta0:.4f}, theta1={theta1:.4f}")

# 打印最终参数
print(f"\n最终参数：theta0={theta0:.4f}, theta1={theta1:.4f}")

# 可视化成本函数下降曲线
plt.plot(range(epochs), cost_history)
plt.xlabel('迭代轮次')
plt.ylabel('成本函数值')
plt.title('梯度下降收敛过程')
plt.show()

# 可视化拟合结果
plt.scatter(X, y, color='blue', label='真实数据')
plt.plot(X, theta0 + theta1*X, color='red', label='手动拟合直线')
plt.xlabel('房屋面积(㎡)')
plt.ylabel('房价(万元)')
plt.legend()
plt.show()
```

### 2. 多元线性回归：Sklearn实现+特征缩放
```python
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

# 生成模拟数据：面积+房间数→房价
X = np.array([
    [50, 1], [60, 1], [70, 2], [80, 2], [90, 3], [100, 3]
])
y = np.array([120, 140, 165, 190, 215, 240])

# 特征缩放（标准化）
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 训练多元线性回归模型
model = LinearRegression()
model.fit(X_scaled, y)

# 预测新数据：面积110㎡，3个房间
new_data = np.array([[110, 3]])
new_data_scaled = scaler.transform(new_data)
predicted_price = model.predict(new_data_scaled)
print(f"面积110㎡、3室的房价预测值：{predicted_price[0]:.2f}万元")
print(f"模型参数：截距={model.intercept_:.4f}, 权重={model.coef_}")
```

---

## 三、逻辑回归
### 1. 手动实现逻辑回归（梯度下降+交叉熵损失）
```python
import numpy as np
import matplotlib.pyplot as plt

def sigmoid(z):
    """Sigmoid激活函数"""
    return 1 / (1 + np.exp(-z))

def compute_cost(X, y, theta):
    """计算交叉熵损失"""
    m = len(y)
    h = sigmoid(np.dot(X, theta))
    cost = (-1/m) * np.sum(y*np.log(h) + (1-y)*np.log(1-h))
    return cost

def gradient_descent(X, y, theta, learning_rate, epochs):
    """梯度下降优化参数"""
    m = len(y)
    cost_history = []
    for i in range(epochs):
        h = sigmoid(np.dot(X, theta))
        gradient = (1/m) * np.dot(X.T, (h - y))
        theta -= learning_rate * gradient
        cost = compute_cost(X, y, theta)
        cost_history.append(cost)
        if i % 10000 == 0:
            print(f"迭代轮次 {i}: 成本={cost:.4f}")
    return theta, cost_history

# 生成模拟二分类数据：肿瘤大小→良性(0)/恶性(1)
X = np.array([[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9]])  # 第一列为截距项x0=1
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

# 初始化参数
theta = np.zeros(X.shape[1])
learning_rate = 0.1
epochs = 100000

# 训练模型
theta, cost_history = gradient_descent(X, y, theta, learning_rate, epochs)
print(f"\n最终参数：theta={theta}")

# 可视化Sigmoid拟合结果
x_values = np.linspace(1, 10, 100)
y_values = sigmoid(theta[0] + theta[1]*x_values)
plt.scatter(X[:,1], y, color='blue', label='真实标签')
plt.plot(x_values, y_values, color='red', label='Sigmoid拟合曲线')
plt.axhline(y=0.5, color='gray', linestyle='--', label='决策阈值(0.5)')
plt.xlabel('肿瘤大小(cm)')
plt.ylabel('恶性概率')
plt.legend()
plt.show()
```

### 2. Sklearn逻辑回归+决策边界可视化
```python
import numpy as np
from sklearn.linear_model import LogisticRegression
import matplotlib.pyplot as plt

# 生成模拟二分类数据：两个特征→类别
X = np.array([
    [1, 2], [2, 3], [3, 1], [4, 2], [5, 4], [6, 5], [7, 3], [8, 4]
])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

# 训练逻辑回归模型
model = LogisticRegression()
model.fit(X, y)

# 生成网格数据用于绘制决策边界
x_min, x_max = X[:,0].min()-1, X[:,0].max()+1
y_min, y_max = X[:,1].min()-1, X[:,1].max()+1
xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.01), np.arange(y_min, y_max, 0.01))
Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
Z = Z.reshape(xx.shape)

# 可视化决策边界
plt.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.coolwarm)
plt.scatter(X[y==0,0], X[y==0,1], color='blue', label='类别0')
plt.scatter(X[y==1,0], X[y==1,1], color='red', label='类别1')
plt.xlabel('特征1')
plt.ylabel('特征2')
plt.legend()
plt.show()
```

---

## 四、过拟合与正则化
### L2正则化（岭回归）：手动实现+Sklearn示例
```python
import numpy as np
from sklearn.linear_model import Ridge
import matplotlib.pyplot as plt

# 生成易过拟合的模拟数据
X = np.array([1,2,3,4,5,6,7,8,9,10])
y = np.array([2,4,5,4,5,7,8,9,10,11]) + np.random.normal(0, 0.5, 10)  # 添加噪声

# --- 手动实现带L2正则化的线性回归 ---
m = len(X)
X_b = np.c_[np.ones(m), X]  # 添加截距项
theta = np.zeros(2)
learning_rate = 0.001
epochs = 100000
lambda_reg = 10  # 正则化参数

cost_history = []
for i in range(epochs):
    h = np.dot(X_b, theta)
    # 带L2正则化的成本函数
    cost = (1/(2*m)) * np.sum((h - y)**2) + (lambda_reg/(2*m)) * np.sum(theta[1:]**2)
    cost_history.append(cost)
    # 带L2正则化的梯度
    grad0 = (1/m) * np.sum(h - y)
    grad1 = (1/m) * np.sum((h - y)*X) + (lambda_reg/m)*theta[1]
    theta[0] -= learning_rate * grad0
    theta[1] -= learning_rate * grad1

# --- Sklearn Ridge回归 ---
model_ridge = Ridge(alpha=10)
model_ridge.fit(X.reshape(-1,1), y)

# 可视化对比：普通线性回归 vs L2正则化回归
plt.scatter(X, y, color='blue', label='带噪声数据')
# 普通线性回归（无正则化）
model_linear = LinearRegression()
model_linear.fit(X.reshape(-1,1), y)
plt.plot(X, model_linear.predict(X.reshape(-1,1)), color='red', label='普通线性回归')
# 手动实现的L2正则化回归
plt.plot(X, theta[0]+theta[1]*X, color='green', label='手动L2正则化回归')
# Sklearn Ridge回归
plt.plot(X, model_ridge.predict(X.reshape(-1,1)), color='black', linestyle='--', label='Sklearn Ridge回归')
plt.xlabel('X')
plt.ylabel('y')
plt.legend()
plt.show()
```
