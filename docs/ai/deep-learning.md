<!-- learning-notes
course: 深度学习
textbook: 《深度学习入门》；《深度学习》
style: exam-review
source_policy: references-section
last_updated: 2026-05-26
-->

# 深度学习

深度学习（Deep Learning）用多层可微函数从数据中学习表示。它的核心不是“层数越多越好”，而是通过**表示学习、反向传播、梯度优化、正则化和大规模数据/算力**，让模型自动学习从低级特征到高级语义的映射。

!!! tip "复习抓手"
    深度学习可以用一条链路串起来：**张量表示数据，网络定义函数，损失衡量错误，反向传播计算梯度，优化器更新参数，正则化和归一化保证泛化与稳定训练。**

## 一、课程地图与深度学习总览

### 1.1 深度学习和传统机器学习的关系

| 维度 | 传统机器学习 | 深度学习 |
| --- | --- | --- |
| 特征 | 依赖人工特征工程 | 自动学习多层表示 |
| 模型 | 线性模型、树、SVM、浅层模型 | MLP、CNN、RNN、Transformer |
| 数据需求 | 中小数据也常有效 | 通常更依赖大量数据 |
| 可解释性 | 较强 | 较弱，需要可视化和分析工具 |
| 计算需求 | 相对低 | GPU/TPU 加速常见 |

```text
输入数据
  -> 低层特征: 边缘、词片段、局部模式
  -> 中层特征: 形状、短语、局部结构
  -> 高层特征: 物体、语义、任务相关表示
  -> 输出: 分类、回归、生成、决策
```

### 1.2 深度学习常见任务

| 任务 | 输出 | 典型模型 |
| --- | --- | --- |
| 图像分类 | 类别 | CNN、ViT |
| 目标检测 | 框 + 类别 | Faster R-CNN、YOLO |
| 语义分割 | 每个像素类别 | FCN、U-Net、DeepLab |
| 文本分类 | 类别 | RNN、CNN、Transformer |
| 序列标注 | 每个 token 标签 | BiLSTM-CRF、BERT |
| 机器翻译 | 目标语言序列 | Seq2Seq、Transformer |
| 生成建模 | 新样本 | VAE、GAN、Diffusion |
| 推荐系统 | 点击/评分/排序 | Embedding、DNN、Wide&Deep |

### 1.3 深度学习训练闭环

```text
Dataset -> DataLoader -> Model -> Loss
                         ^       |
                         |       v
                    Optimizer <- Gradients
```

训练过程：

1. 前向传播计算预测。
2. 损失函数计算预测与标签的差距。
3. 反向传播计算参数梯度。
4. 优化器更新参数。
5. 在验证集上评估泛化性能。

### 1.4 张量维度习惯

| 数据类型 | 常见张量形状 |
| --- | --- |
| 表格数据 | `(batch_size, num_features)` |
| 灰度图像 | `(batch_size, 1, height, width)` |
| RGB 图像 | `(batch_size, 3, height, width)` |
| 文本 token | `(batch_size, seq_len)` |
| 序列嵌入 | `(batch_size, seq_len, hidden_size)` |
| 分类输出 logits | `(batch_size, num_classes)` |

!!! warning "维度是深度学习调试第一现场"
    如果模型报错，先打印每一层输入输出 shape。多数初学问题不是公式错，而是 batch、channel、seq_len 或 hidden_size 顺序错。

## 二、数学基础与张量计算

### 2.1 标量、向量、矩阵、张量

| 对象 | 例子 | 维度 |
| --- | --- | --- |
| 标量 | \(x=3\) | 0D |
| 向量 | \(x=[1,2,3]^T\) | 1D |
| 矩阵 | \(X\in \mathbb{R}^{m\times n}\) | 2D |
| 张量 | 图像 batch \(N\times C\times H\times W\) | 多维 |

### 2.2 线性变换

全连接层本质是仿射变换：

\[
Z = XW + b
\]

若：

- \(X \in \mathbb{R}^{m\times d}\)
- \(W \in \mathbb{R}^{d\times h}\)
- \(b \in \mathbb{R}^{h}\)

则：

\[
Z \in \mathbb{R}^{m\times h}
\]

### 2.3 常用范数

L1 范数：

\[
\|x\|_1 = \sum_i |x_i|
\]

L2 范数：

\[
\|x\|_2 = \sqrt{\sum_i x_i^2}
\]

Frobenius 范数：

\[
\|W\|_F = \sqrt{\sum_i\sum_j W_{ij}^2}
\]

正则化中常用 L2：

\[
J_{reg}=J+\frac{\lambda}{2}\|W\|_2^2
\]

### 2.4 概率输出

二分类常用 Sigmoid：

\[
\sigma(z)=\frac{1}{1+e^{-z}}
\]

多分类常用 Softmax：

\[
softmax(z)_i = \frac{e^{z_i}}{\sum_{j=1}^{K}e^{z_j}}
\]

数值稳定写法：

\[
softmax(z)_i = \frac{e^{z_i-\max(z)}}{\sum_{j=1}^{K}e^{z_j-\max(z)}}
\]

## 三、神经网络基础

### 3.1 单个神经元

神经元做两步：

\[
z=w^Tx+b
\]

\[
a=g(z)
\]

其中：

- \(w\)：权重。
- \(b\)：偏置。
- \(g\)：激活函数。
- \(a\)：激活值。

```text
x1 ---- w1 \
x2 ---- w2  +--> z = w^T x + b --> activation --> a
x3 ---- w3 /
```

### 3.2 逻辑回归是单层神经网络

二分类逻辑回归：

\[
z=w^Tx+b
\]

\[
\hat{y}=\sigma(z)
\]

单样本交叉熵：

\[
L(\hat{y},y)=-[y\log\hat{y}+(1-y)\log(1-\hat{y})]
\]

整体代价：

\[
J(w,b)=\frac{1}{m}\sum_{i=1}^{m}L(\hat{y}^{(i)},y^{(i)})
\]

### 3.3 多层感知机

第 \(l\) 层：

\[
Z^{[l]} = W^{[l]}A^{[l-1]}+b^{[l]}
\]

\[
A^{[l]} = g^{[l]}(Z^{[l]})
\]

其中：

\[
A^{[0]}=X
\]

对于 \(L\) 层网络：

```text
X = A[0]
  -> Linear + Activation -> A[1]
  -> Linear + Activation -> A[2]
  -> ...
  -> Linear + Output Activation -> A[L]
```

### 3.4 常用激活函数

| 激活函数 | 公式 | 优点 | 缺点 |
| --- | --- | --- | --- |
| Sigmoid | \(\sigma(z)=\frac{1}{1+e^{-z}}\) | 可解释为概率 | 梯度消失、非零均值 |
| Tanh | \(\tanh(z)\) | 零均值 | 仍可能梯度消失 |
| ReLU | \(\max(0,z)\) | 简单、高效、缓解梯度消失 | 可能死亡 ReLU |
| Leaky ReLU | \(\max(\alpha z,z)\) | 负半轴仍有梯度 | 多一个超参数 |
| GELU | \(x\Phi(x)\) | Transformer 常用 | 计算稍复杂 |

ReLU 导数：

\[
\frac{d}{dz}ReLU(z)=
\begin{cases}
1, & z>0 \\
0, & z\le 0
\end{cases}
\]

### 3.5 输出层选择

| 任务 | 输出层 | 损失函数 |
| --- | --- | --- |
| 回归 | Linear | MSE / MAE |
| 二分类 | Sigmoid | Binary Cross Entropy |
| 多分类单标签 | Softmax | Cross Entropy |
| 多标签分类 | Sigmoid per label | Binary Cross Entropy |

## 四、反向传播与自动微分

### 4.1 梯度下降

参数更新：

\[
\theta := \theta - \alpha \nabla_\theta J(\theta)
\]

对单个参数：

\[
\theta_j := \theta_j - \alpha\frac{\partial J}{\partial \theta_j}
\]

### 4.2 链式法则

若：

\[
y=f(u),\quad u=g(x)
\]

则：

\[
\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}
\]

深层网络就是大量函数复合，反向传播本质上是高效应用链式法则。

### 4.3 单层反向传播公式

对第 \(l\) 层：

\[
Z^{[l]}=W^{[l]}A^{[l-1]}+b^{[l]}
\]

\[
A^{[l]}=g(Z^{[l]})
\]

已知 \(dZ^{[l]}\)，则：

\[
dW^{[l]}=\frac{1}{m}dZ^{[l]}(A^{[l-1]})^T
\]

\[
db^{[l]}=\frac{1}{m}\sum_{i=1}^{m}dZ^{[l](i)}
\]

\[
dA^{[l-1]}=(W^{[l]})^TdZ^{[l]}
\]

若激活函数为 \(g\)：

\[
dZ^{[l]}=dA^{[l]}\odot g'(Z^{[l]})
\]

### 4.4 Softmax + 交叉熵梯度

Softmax：

\[
\hat{y}_k=\frac{e^{z_k}}{\sum_j e^{z_j}}
\]

交叉熵：

\[
L=-\sum_k y_k\log\hat{y}_k
\]

二者组合后有简洁梯度：

\[
\frac{\partial L}{\partial z_k}=\hat{y}_k-y_k
\]

这是深度学习分类任务中非常重要的结论。

### 4.5 计算图直觉

```text
X, W, b -> Z -> A -> Loss
              ^     |
              |     v
          gradients back
```

自动微分框架会记录前向计算图，在 `loss.backward()` 时沿图反向计算梯度。

### 4.6 NumPy 实验：两层神经网络

??? example "Code"
    ```python
    import numpy as np

    def relu(z):
        return np.maximum(0, z)

    def relu_backward(dA, Z):
        dZ = dA.copy()
        dZ[Z <= 0] = 0
        return dZ

    def softmax(z):
        z = z - np.max(z, axis=1, keepdims=True)
        exp_z = np.exp(z)
        return exp_z / np.sum(exp_z, axis=1, keepdims=True)

    def one_hot(y, num_classes):
        out = np.zeros((len(y), num_classes))
        out[np.arange(len(y)), y] = 1
        return out

    def train_two_layer_mlp(X, y, hidden_size=16, lr=0.1, epochs=1000):
        n, d = X.shape
        num_classes = int(y.max()) + 1
        Y = one_hot(y, num_classes)

        rng = np.random.default_rng(42)
        W1 = rng.normal(0, np.sqrt(2 / d), size=(d, hidden_size))
        b1 = np.zeros(hidden_size)
        W2 = rng.normal(0, np.sqrt(2 / hidden_size), size=(hidden_size, num_classes))
        b2 = np.zeros(num_classes)

        for epoch in range(epochs):
            Z1 = X @ W1 + b1
            A1 = relu(Z1)
            Z2 = A1 @ W2 + b2
            P = softmax(Z2)

            loss = -np.mean(np.sum(Y * np.log(P + 1e-12), axis=1))

            dZ2 = (P - Y) / n
            dW2 = A1.T @ dZ2
            db2 = dZ2.sum(axis=0)
            dA1 = dZ2 @ W2.T
            dZ1 = relu_backward(dA1, Z1)
            dW1 = X.T @ dZ1
            db1 = dZ1.sum(axis=0)

            W1 -= lr * dW1
            b1 -= lr * db1
            W2 -= lr * dW2
            b2 -= lr * db2

            if epoch % 200 == 0:
                pred = P.argmax(axis=1)
                acc = (pred == y).mean()
                print(f"epoch={epoch}, loss={loss:.4f}, acc={acc:.3f}")

        return (W1, b1, W2, b2)
    ```

## 五、初始化、归一化与优化器

### 5.1 为什么初始化重要

若权重过小：

- 激活值接近 0。
- 梯度可能逐层变小。

若权重过大：

- 激活值或梯度可能爆炸。
- Sigmoid/Tanh 进入饱和区。

### 5.2 Xavier 与 He 初始化

Xavier 初始化适合 Tanh/Sigmoid：

\[
Var(W)=\frac{2}{n_{in}+n_{out}}
\]

He 初始化适合 ReLU：

\[
Var(W)=\frac{2}{n_{in}}
\]

PyTorch 中：

```python
import torch.nn as nn

layer = nn.Linear(128, 64)
nn.init.kaiming_normal_(layer.weight, nonlinearity="relu")
nn.init.zeros_(layer.bias)
```

### 5.3 梯度消失与梯度爆炸

| 问题 | 表现 | 常见处理 |
| --- | --- | --- |
| 梯度消失 | 前层几乎学不动 | ReLU、残差连接、归一化、合适初始化 |
| 梯度爆炸 | loss 变 NaN、参数剧烈震荡 | 梯度裁剪、减小学习率、归一化 |

梯度裁剪：

```python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

### 5.4 Batch Normalization

对 mini-batch 中某层输入做标准化：

\[
\mu_B=\frac{1}{m}\sum_{i=1}^{m}x_i
\]

\[
\sigma_B^2=\frac{1}{m}\sum_{i=1}^{m}(x_i-\mu_B)^2
\]

\[
\hat{x}_i=\frac{x_i-\mu_B}{\sqrt{\sigma_B^2+\epsilon}}
\]

\[
y_i=\gamma\hat{x}_i+\beta
\]

作用：

- 稳定激活分布。
- 允许较大学习率。
- 有轻微正则化效果。

### 5.5 Layer Normalization

LayerNorm 在单个样本的特征维度上归一化，常用于 RNN 和 Transformer。

| 归一化 | 归一化维度 | 常见场景 |
| --- | --- | --- |
| BatchNorm | batch 维度 | CNN |
| LayerNorm | feature 维度 | Transformer |

### 5.6 优化器

#### SGD

\[
\theta := \theta - \alpha g_t
\]

#### Momentum

\[
v_t=\beta v_{t-1}+(1-\beta)g_t
\]

\[
\theta := \theta-\alpha v_t
\]

#### RMSProp

\[
s_t=\beta s_{t-1}+(1-\beta)g_t^2
\]

\[
\theta := \theta-\alpha\frac{g_t}{\sqrt{s_t}+\epsilon}
\]

#### Adam

\[
v_t=\beta_1v_{t-1}+(1-\beta_1)g_t
\]

\[
s_t=\beta_2s_{t-1}+(1-\beta_2)g_t^2
\]

偏差修正：

\[
\hat{v}_t=\frac{v_t}{1-\beta_1^t}
\]

\[
\hat{s}_t=\frac{s_t}{1-\beta_2^t}
\]

更新：

\[
\theta := \theta-\alpha\frac{\hat{v}_t}{\sqrt{\hat{s}_t}+\epsilon}
\]

### 5.7 学习率调度

| 方法 | 思路 |
| --- | --- |
| Step Decay | 每隔若干 epoch 降低学习率 |
| Exponential Decay | 指数衰减 |
| Cosine Annealing | 余弦下降 |
| Warmup | 前期逐渐增大学习率 |
| ReduceLROnPlateau | 验证集不提升时降低学习率 |

```python
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer,
    T_max=20
)
```

## 六、正则化与泛化

### 6.1 L2 正则化与权重衰减

L2 正则：

\[
J_{reg}=J+\frac{\lambda}{2m}\sum_l\|W^{[l]}\|_F^2
\]

PyTorch 中常用 `weight_decay`：

```python
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=1e-3,
    weight_decay=1e-4
)
```

### 6.2 Dropout

训练时随机丢弃部分神经元：

\[
\tilde{a}^{[l]} = d^{[l]}\odot a^{[l]}
\]

其中 \(d^{[l]}\) 是 Bernoulli mask。

反向直觉：

- 每次训练不同子网络。
- 减少神经元间复杂共适应。
- 推理时使用完整网络。

PyTorch：

```python
nn.Dropout(p=0.5)
```

### 6.3 数据增强

图像常用：

- 随机裁剪。
- 水平翻转。
- 颜色扰动。
- Cutout、Mixup、CutMix。

文本常用：

- 同义词替换。
- 随机删除。
- 回译。
- Mask token。

### 6.4 Early Stopping

当验证集指标长期不提升时停止训练。

```text
best_val_loss = inf
patience = 5
if val_loss improves:
    save checkpoint
else:
    wait += 1
if wait >= patience:
    stop training
```

### 6.5 数据泄漏

常见错误：

- 在全数据上 fit 标准化器。
- 测试集参与调参。
- 数据增强或采样没有按训练/测试隔离。
- 同一用户或同一病例数据同时出现在训练和测试中。

正确原则：所有从数据中“学习”的预处理步骤都只能在训练集上 fit。

## 七、卷积神经网络 CNN

### 7.1 为什么 CNN 适合图像

CNN 利用图像的三个性质：

| 性质 | 含义 |
| --- | --- |
| 局部连接 | 局部像素强相关 |
| 权重共享 | 同一个特征可在不同位置出现 |
| 平移等变 | 输入平移后特征图相应平移 |

### 7.2 卷积输出尺寸

若输入尺寸为 \(H\times W\)，卷积核大小 \(F\)，填充 \(P\)，步幅 \(S\)，则输出：

\[
H_{out}=\left\lfloor\frac{H+2P-F}{S}\right\rfloor+1
\]

\[
W_{out}=\left\lfloor\frac{W+2P-F}{S}\right\rfloor+1
\]

参数量：

\[
Params = F_h \times F_w \times C_{in} \times C_{out} + C_{out}
\]

### 7.3 卷积层直觉

```text
Input image
  -> Conv 3x3: edge / texture
  -> Conv 3x3: local parts
  -> Conv 3x3: object patterns
  -> Classifier
```

### 7.4 池化

最大池化：

\[
y=\max_{i,j\in window}x_{ij}
\]

平均池化：

\[
y=\frac{1}{|window|}\sum_{i,j\in window}x_{ij}
\]

作用：

- 降低空间尺寸。
- 减少计算量。
- 增强局部平移鲁棒性。

### 7.5 经典 CNN

| 模型 | 核心思想 |
| --- | --- |
| LeNet | 早期 CNN，用于手写数字 |
| AlexNet | ReLU、Dropout、GPU 训练 |
| VGG | 多个小卷积核堆叠 |
| GoogLeNet | Inception 多尺度分支 |
| ResNet | 残差连接，训练很深网络 |

### 7.6 残差连接

普通映射：

\[
H(x)
\]

残差学习：

\[
H(x)=F(x)+x
\]

```text
x -----> + -----> output
 \       ^
  \      |
   -> F(x)
```

残差连接让梯度更容易传回前层，缓解深层网络退化问题。

### 7.7 PyTorch 实验：CNN 图像分类

??? example "Code"
    ```python
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch.utils.data import DataLoader
    from torchvision import datasets, transforms

    class SimpleCNN(nn.Module):
        def __init__(self, num_classes=10):
            super().__init__()
            self.features = nn.Sequential(
                nn.Conv2d(1, 32, kernel_size=3, padding=1),
                nn.BatchNorm2d(32),
                nn.ReLU(),
                nn.MaxPool2d(2),
                nn.Conv2d(32, 64, kernel_size=3, padding=1),
                nn.BatchNorm2d(64),
                nn.ReLU(),
                nn.MaxPool2d(2)
            )
            self.classifier = nn.Sequential(
                nn.Flatten(),
                nn.Linear(64 * 7 * 7, 128),
                nn.ReLU(),
                nn.Dropout(0.5),
                nn.Linear(128, num_classes)
            )

        def forward(self, x):
            x = self.features(x)
            return self.classifier(x)

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])

    train_dataset = datasets.MNIST(
        root="./data",
        train=True,
        download=True,
        transform=transform
    )
    test_dataset = datasets.MNIST(
        root="./data",
        train=False,
        download=True,
        transform=transform
    )

    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=256)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = SimpleCNN().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

    for epoch in range(3):
        model.train()
        for X, y in train_loader:
            X, y = X.to(device), y.to(device)
            logits = model(X)
            loss = criterion(logits, y)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for X, y in test_loader:
                X, y = X.to(device), y.to(device)
                pred = model(X).argmax(dim=1)
                correct += (pred == y).sum().item()
                total += y.numel()

        print(f"epoch={epoch + 1}, test_acc={correct / total:.4f}")
    ```

## 八、循环神经网络 RNN、LSTM 与 GRU

### 8.1 序列建模

序列任务输入具有时间或顺序结构：

```text
x1 -> x2 -> x3 -> ... -> xT
```

例：

- 文本分类。
- 语言模型。
- 机器翻译。
- 时间序列预测。

### 8.2 基础 RNN

隐藏状态更新：

\[
h_t=\tanh(W_{xh}x_t+W_{hh}h_{t-1}+b_h)
\]

输出：

\[
o_t=W_{hy}h_t+b_y
\]

问题：

- 长序列中梯度容易消失或爆炸。
- 很难捕捉长期依赖。

### 8.3 LSTM

LSTM 用门控机制控制信息流。

遗忘门：

\[
f_t=\sigma(W_f[h_{t-1},x_t]+b_f)
\]

输入门：

\[
i_t=\sigma(W_i[h_{t-1},x_t]+b_i)
\]

候选记忆：

\[
\tilde{c}_t=\tanh(W_c[h_{t-1},x_t]+b_c)
\]

细胞状态：

\[
c_t=f_t\odot c_{t-1}+i_t\odot \tilde{c}_t
\]

输出门：

\[
o_t=\sigma(W_o[h_{t-1},x_t]+b_o)
\]

隐藏状态：

\[
h_t=o_t\odot\tanh(c_t)
\]

### 8.4 GRU

GRU 更简洁：

更新门：

\[
z_t=\sigma(W_z[h_{t-1},x_t])
\]

重置门：

\[
r_t=\sigma(W_r[h_{t-1},x_t])
\]

候选状态：

\[
\tilde{h}_t=\tanh(W_h[r_t\odot h_{t-1},x_t])
\]

最终状态：

\[
h_t=(1-z_t)\odot h_{t-1}+z_t\odot \tilde{h}_t
\]

### 8.5 Embedding

词嵌入把离散 token 映射为连续向量。

```text
token id -> embedding table lookup -> dense vector
```

若词表大小为 \(V\)，嵌入维度为 \(d\)，Embedding 参数量：

\[
V \times d
\]

### 8.6 PyTorch 实验：LSTM 文本分类骨架

??? example "Code"
    ```python
    import torch
    import torch.nn as nn

    class LSTMTextClassifier(nn.Module):
        def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes, padding_idx=0):
            super().__init__()
            self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=padding_idx)
            self.lstm = nn.LSTM(
                input_size=embed_dim,
                hidden_size=hidden_dim,
                num_layers=1,
                batch_first=True,
                bidirectional=True
            )
            self.fc = nn.Linear(hidden_dim * 2, num_classes)

        def forward(self, input_ids):
            x = self.embedding(input_ids)
            output, (h_n, c_n) = self.lstm(x)
            h_forward = h_n[-2]
            h_backward = h_n[-1]
            h = torch.cat([h_forward, h_backward], dim=1)
            return self.fc(h)

    batch_size = 4
    seq_len = 8
    vocab_size = 1000
    input_ids = torch.randint(1, vocab_size, (batch_size, seq_len))

    model = LSTMTextClassifier(
        vocab_size=vocab_size,
        embed_dim=64,
        hidden_dim=128,
        num_classes=3
    )
    logits = model(input_ids)
    print(logits.shape)  # (4, 3)
    ```

## 九、注意力机制与 Transformer

### 9.1 Attention 的直觉

注意力机制让模型在生成某个表示时，根据相关性动态关注输入中的不同位置。

```text
Query: 我现在要找什么
Key:   每个位置有什么索引
Value: 每个位置真正提供什么信息
```

### 9.2 Scaled Dot-Product Attention

给定：

- \(Q\in \mathbb{R}^{n_q\times d_k}\)
- \(K\in \mathbb{R}^{n_k\times d_k}\)
- \(V\in \mathbb{R}^{n_k\times d_v}\)

注意力：

\[
Attention(Q,K,V)=softmax\left(\frac{QK^T}{\sqrt{d_k}}\right)V
\]

除以 \(\sqrt{d_k}\) 是为了避免点积过大导致 softmax 饱和。

### 9.3 Multi-Head Attention

多头注意力把表示分成多个子空间并行学习：

\[
head_i=Attention(QW_i^Q,KW_i^K,VW_i^V)
\]

\[
MultiHead(Q,K,V)=Concat(head_1,\dots,head_h)W^O
\]

### 9.4 Transformer Block

```text
x
 |-- Multi-Head Self-Attention
 |-- Add & LayerNorm
 |-- Feed Forward Network
 |-- Add & LayerNorm
 v
output
```

前馈网络：

\[
FFN(x)=\max(0,xW_1+b_1)W_2+b_2
\]

### 9.5 位置编码

Transformer 没有循环结构，需要显式注入位置信息。

正弦位置编码：

\[
PE_{(pos,2i)}=\sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)
\]

\[
PE_{(pos,2i+1)}=\cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)
\]

### 9.6 PyTorch 实验：Transformer Encoder 分类器

??? example "Code"
    ```python
    import torch
    import torch.nn as nn

    class TransformerClassifier(nn.Module):
        def __init__(self, vocab_size, embed_dim, num_heads, num_layers, num_classes, max_len=256):
            super().__init__()
            self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
            self.position = nn.Embedding(max_len, embed_dim)

            encoder_layer = nn.TransformerEncoderLayer(
                d_model=embed_dim,
                nhead=num_heads,
                dim_feedforward=embed_dim * 4,
                dropout=0.1,
                batch_first=True
            )
            self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
            self.fc = nn.Linear(embed_dim, num_classes)

        def forward(self, input_ids):
            batch_size, seq_len = input_ids.shape
            pos = torch.arange(seq_len, device=input_ids.device).unsqueeze(0).expand(batch_size, seq_len)
            x = self.embedding(input_ids) + self.position(pos)

            padding_mask = input_ids.eq(0)
            h = self.encoder(x, src_key_padding_mask=padding_mask)

            cls = h[:, 0, :]
            return self.fc(cls)

    model = TransformerClassifier(
        vocab_size=5000,
        embed_dim=128,
        num_heads=4,
        num_layers=2,
        num_classes=2
    )

    input_ids = torch.randint(1, 5000, (8, 32))
    logits = model(input_ids)
    print(logits.shape)  # (8, 2)
    ```

## 十、生成模型基础

### 10.1 Autoencoder

自编码器学习压缩表示并重构输入。

```text
x -> Encoder -> z -> Decoder -> x_hat
```

重构损失：

\[
L=\|x-\hat{x}\|^2
\]

用途：

- 降维。
- 去噪。
- 异常检测。
- 表示学习。

### 10.2 VAE

VAE 学习潜变量分布：

\[
q_\phi(z|x)
\]

并用解码器生成：

\[
p_\theta(x|z)
\]

目标函数包含重构项和 KL 散度：

\[
L = \mathbb{E}_{q_\phi(z|x)}[\log p_\theta(x|z)]
-D_{KL}(q_\phi(z|x)\|p(z))
\]

### 10.3 GAN

GAN 包含生成器 \(G\) 和判别器 \(D\)：

\[
\min_G \max_D
\mathbb{E}_{x\sim p_{data}}[\log D(x)]
+\mathbb{E}_{z\sim p_z}[\log(1-D(G(z)))]
\]

直觉：

- 判别器学习区分真样本和假样本。
- 生成器学习骗过判别器。

### 10.4 Diffusion 直觉

扩散模型逐步给数据加噪，再学习反向去噪过程。

```text
x0 -> x1 -> x2 -> ... -> xT   forward noising
xT -> ... -> x2 -> x1 -> x0   reverse denoising
```

在现代图像生成中非常重要，但公式较多，可单独深入。

## 十一、训练工程与实验模板

### 11.1 标准训练循环

??? example "Code"
    ```python
    import torch

    def train_one_epoch(model, loader, criterion, optimizer, device):
        model.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for X, y in loader:
            X, y = X.to(device), y.to(device)

            logits = model(X)
            loss = criterion(logits, y)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * X.size(0)
            pred = logits.argmax(dim=1)
            correct += (pred == y).sum().item()
            total += y.numel()

        return total_loss / total, correct / total

    @torch.no_grad()
    def evaluate(model, loader, criterion, device):
        model.eval()
        total_loss = 0.0
        correct = 0
        total = 0

        for X, y in loader:
            X, y = X.to(device), y.to(device)
            logits = model(X)
            loss = criterion(logits, y)

            total_loss += loss.item() * X.size(0)
            pred = logits.argmax(dim=1)
            correct += (pred == y).sum().item()
            total += y.numel()

        return total_loss / total, correct / total
    ```

### 11.2 完整实验主函数骨架

??? example "Code"
    ```python
    import random
    import numpy as np
    import torch
    import torch.nn as nn

    def set_seed(seed=42):
        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

    def main(train_loader, val_loader, model):
        set_seed(42)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = model.to(device)

        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=20)

        best_val_acc = 0.0

        for epoch in range(20):
            train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
            val_loss, val_acc = evaluate(model, val_loader, criterion, device)
            scheduler.step()

            print(
                f"epoch={epoch+1:02d} "
                f"train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
                f"val_loss={val_loss:.4f} val_acc={val_acc:.4f}"
            )

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save(model.state_dict(), "best_model.pt")

        print("best_val_acc:", best_val_acc)
    ```

### 11.3 训练/验证模式

| 调用 | 作用 |
| --- | --- |
| `model.train()` | 启用 Dropout，BatchNorm 使用 batch 统计 |
| `model.eval()` | 关闭 Dropout，BatchNorm 使用 running 统计 |
| `torch.no_grad()` | 不记录梯度，节省显存和计算 |
| `optimizer.zero_grad()` | 清空上一轮梯度 |
| `loss.backward()` | 反向传播计算梯度 |
| `optimizer.step()` | 更新参数 |

### 11.4 保存和加载模型

```python
torch.save(model.state_dict(), "model.pt")

model = SimpleCNN()
model.load_state_dict(torch.load("model.pt", map_location="cpu"))
model.eval()
```

### 11.5 混合精度训练

```python
scaler = torch.cuda.amp.GradScaler()

for X, y in train_loader:
    X, y = X.to(device), y.to(device)

    optimizer.zero_grad()
    with torch.cuda.amp.autocast():
        logits = model(X)
        loss = criterion(logits, y)

    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

混合精度可减少显存、加速训练，但要注意数值稳定。

## 十二、调试与性能诊断

### 12.1 训练前检查

| 检查项 | 说明 |
| --- | --- |
| 输入 shape | 是否符合模型期望 |
| 标签 shape | 分类任务通常为 `(batch,)` |
| 标签范围 | `CrossEntropyLoss` 要求类别为 `0..C-1` |
| 数据归一化 | 图像是否按训练设置 normalize |
| loss 初值 | 是否接近合理范围 |
| 小数据过拟合 | 模型能否在几十个样本上训练到接近 100% |

### 12.2 常见训练现象

| 现象 | 可能原因 | 处理 |
| --- | --- | --- |
| loss 不下降 | 学习率不合适、模型太弱、标签错 | 调学习率、检查数据、先过拟合小样本 |
| loss NaN | 学习率过大、除零、log(0)、梯度爆炸 | 降学习率、加 eps、梯度裁剪 |
| 训练好验证差 | 过拟合 | 数据增强、正则化、Dropout、早停 |
| 训练和验证都差 | 欠拟合 | 增大模型、训练更久、换特征/架构 |
| GPU 利用率低 | 数据加载慢 | 增加 `num_workers`、预处理缓存 |

### 12.3 梯度检查

如果手写反向传播，可用数值梯度检查：

\[
\frac{\partial J}{\partial \theta}
\approx
\frac{J(\theta+\epsilon)-J(\theta-\epsilon)}{2\epsilon}
\]

若数值梯度和反向传播梯度差异很大，说明实现有 bug。

### 12.4 误差分析

训练完成后不要只看一个 accuracy，应查看：

- 哪些类别最容易错。
- 错误样本是否标注有问题。
- 数据是否分布偏移。
- 类别是否不平衡。
- 模型是否对某些背景、风格或长度敏感。

## 十三、迁移学习与预训练模型

### 13.1 迁移学习

迁移学习利用在大数据上预训练的模型，迁移到小数据任务。

常见策略：

| 策略 | 做法 |
| --- | --- |
| Feature Extractor | 冻结 backbone，只训练分类头 |
| Fine-tuning | 解冻部分或全部层，用小学习率微调 |
| Linear Probing | 冻结预训练模型，训练线性分类器 |

### 13.2 PyTorch 实验：微调 ResNet

```python
import torch.nn as nn
from torchvision import models

def build_finetune_resnet(num_classes):
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    for param in model.parameters():
        param.requires_grad = False

    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    return model

model = build_finetune_resnet(num_classes=5)
```

若数据量较大，可解冻最后几层：

```python
for name, param in model.named_parameters():
    if name.startswith("layer4") or name.startswith("fc"):
        param.requires_grad = True
```

### 13.3 预训练语言模型

Transformer 预训练模型常见使用方式：

- 使用 tokenizer 把文本转成 token id。
- 加载预训练模型。
- 在下游任务上 fine-tune。
- 用验证集控制过拟合。

## 十四、高频易错点

| 知识点 | 易错说法 | 正确理解 |
| --- | --- | --- |
| 深度学习 | 层越深一定越好 | 深层网络更难训练，需要残差、归一化和足够数据 |
| Sigmoid | 所有隐藏层都适合用 | 深层网络中容易梯度消失，隐藏层常用 ReLU/GELU |
| Softmax | 先手动 softmax 再喂 `CrossEntropyLoss` | PyTorch 的 `CrossEntropyLoss` 接收 logits |
| `model.eval()` | 只是提高速度 | 它会改变 Dropout 和 BatchNorm 行为 |
| 梯度 | 每轮会自动清零 | PyTorch 默认累积梯度，需要 `zero_grad()` |
| Dropout | 推理时也随机丢弃 | eval 模式下 Dropout 关闭 |
| BatchNorm | 小 batch 总是稳定 | batch 太小统计不稳，可考虑 LayerNorm/GroupNorm |
| 过拟合 | 只靠加深模型解决 | 应使用数据增强、正则化、早停、更多数据 |
| CNN | 卷积一定降低尺寸 | 输出尺寸取决于 padding、stride、kernel |
| RNN | 天然能记住很长上下文 | 基础 RNN 长期依赖困难，LSTM/GRU 改进 |
| Attention | 完全不需要位置信息 | 自注意力本身不含顺序，需位置编码 |
| 迁移学习 | 预训练模型无需验证 | 仍需验证集和合适学习率 |

## 十五、公式速查

| 内容 | 公式 |
| --- | --- |
| 线性层 | \(Z=XW+b\) |
| 神经元 | \(a=g(w^Tx+b)\) |
| Sigmoid | \(\sigma(z)=\frac{1}{1+e^{-z}}\) |
| ReLU | \(ReLU(z)=\max(0,z)\) |
| Softmax | \(softmax(z)_i=\frac{e^{z_i}}{\sum_j e^{z_j}}\) |
| 二分类交叉熵 | \(-[y\log\hat{y}+(1-y)\log(1-\hat{y})]\) |
| 多分类交叉熵 | \(-\sum_k y_k\log\hat{y}_k\) |
| 前向传播 | \(Z^{[l]}=W^{[l]}A^{[l-1]}+b^{[l]}\) |
| 激活 | \(A^{[l]}=g^{[l]}(Z^{[l]})\) |
| 权重梯度 | \(dW^{[l]}=\frac{1}{m}dZ^{[l]}(A^{[l-1]})^T\) |
| 偏置梯度 | \(db^{[l]}=\frac{1}{m}\sum_i dZ^{[l](i)}\) |
| 梯度下降 | \(\theta:=\theta-\alpha\nabla_\theta J\) |
| L2 正则 | \(J_{reg}=J+\frac{\lambda}{2m}\sum_l\|W^{[l]}\|_F^2\) |
| 卷积输出高 | \(H_{out}=\lfloor\frac{H+2P-F}{S}\rfloor+1\) |
| 卷积参数量 | \(F_hF_wC_{in}C_{out}+C_{out}\) |
| RNN | \(h_t=\tanh(W_{xh}x_t+W_{hh}h_{t-1}+b_h)\) |
| Attention | \(softmax(\frac{QK^T}{\sqrt{d_k}})V\) |
| Adam 更新 | \(\theta:=\theta-\alpha\frac{\hat{v}_t}{\sqrt{\hat{s}_t}+\epsilon}\) |

## 十六、复习路线

### 第一轮：基础网络

1. 张量 shape、线性层、激活函数。
2. 逻辑回归、MLP、交叉熵。
3. 前向传播和反向传播公式。
4. 梯度下降、SGD、Momentum、Adam。

### 第二轮：训练稳定性

1. Xavier/He 初始化。
2. 梯度消失和梯度爆炸。
3. BatchNorm、LayerNorm。
4. Dropout、L2、数据增强、早停。

### 第三轮：核心架构

1. CNN：卷积、池化、输出尺寸、ResNet。
2. RNN/LSTM/GRU：序列建模和门控机制。
3. Attention/Transformer：QKV、多头注意力、位置编码。
4. 生成模型：Autoencoder、VAE、GAN、Diffusion 直觉。

### 第四轮：实验能力

1. 会写标准 PyTorch 训练循环。
2. 会保存最佳模型和复现实验。
3. 会检查 shape、loss、梯度、学习率。
4. 会在小数据上过拟合模型验证代码正确性。
5. 会做错误分析和调参记录。

## 十七、参考资料

- 斋藤康毅：《深度学习入门：基于 Python 的理论与实现》。
- Ian Goodfellow, Yoshua Bengio, Aaron Courville：《深度学习》。
- Andrew Ng：《Deep Learning Specialization》视频课程，用于参考神经网络、优化、正则化、CNN、序列模型等主线。
- 李沐等：《动手学深度学习》视频与教材，用于参考 PyTorch 实践、训练技巧、CNN、RNN、Attention 与 Transformer。
