# 深度学习

## 一、神经网络基础
### 1.1 逻辑回归：单层神经网络入门
逻辑回归是用于二分类任务的基础模型，可视为只有输出层的单层神经网络。

#### 核心公式
- 线性变换：\(z = w^T x + b\)，其中\(w\)为权重向量，\(b\)为偏置，\(x\)为输入特征
- 激活函数（Sigmoid）：\(\hat{y} = \sigma(z) = \frac{1}{1 + e^{-z}}\)，将输出映射到(0,1)区间，表示样本属于正类的概率
- 损失函数（交叉熵损失）：\(L(\hat{y}, y) = -[y \log\hat{y} + (1-y)\log(1-\hat{y})]\)
- 成本函数（全体样本损失均值）：\(J(w,b) = \frac{1}{m}\sum_{i=1}^m L(\hat{y}^{(i)}, y^{(i)})\)

#### Python代码实现（Numpy）
```python
import numpy as np

def sigmoid(z):
    """实现Sigmoid激活函数"""
    return 1 / (1 + np.exp(-z))

def forward_propagation(X, w, b):
    """前向传播计算预测值"""
    z = np.dot(w.T, X) + b
    y_hat = sigmoid(z)
    return y_hat

def compute_cost(y_hat, y):
    """计算交叉熵损失"""
    m = y.shape[1]
    cost = -1/m * np.sum(y * np.log(y_hat) + (1 - y) * np.log(1 - y_hat))
    return np.squeeze(cost)  # 压缩维度为标量
```

### 1.2 梯度下降：参数优化方法
梯度下降通过迭代更新模型参数，最小化成本函数。核心是计算损失对参数的偏导数，沿负梯度方向更新参数。

#### 核心公式
参数更新规则：
\(w = w - \alpha \frac{\partial J(w,b)}{\partial w}\)
\(b = b - \alpha \frac{\partial J(w,b)}{\partial b}\)
其中\(\alpha\)为学习率，控制每一步的更新幅度。

#### Python代码实现（逻辑回归的梯度计算与更新）
```python
def compute_gradient(X, y, y_hat):
    """计算损失对w和b的梯度"""
    m = X.shape[1]
    dw = 1/m * np.dot(X, (y_hat - y).T)
    db = 1/m * np.sum(y_hat - y)
    return dw, db

def gradient_descent(X, y, w, b, learning_rate, num_iterations):
    """梯度下降迭代优化参数"""
    costs = []
    for i in range(num_iterations):
        y_hat = forward_propagation(X, w, b)
        cost = compute_cost(y_hat, y)
        dw, db = compute_gradient(X, y, y_hat)
        
        # 更新参数
        w -= learning_rate * dw
        b -= learning_rate * db
        
        # 记录损失
        if i % 100 == 0:
            costs.append(cost)
            print(f"迭代次数 {i}, 成本 {cost:.4f}")
    return w, b, costs
```

### 1.3 反向传播：梯度计算的核心逻辑
反向传播是通过链式法则从输出层到输入层逐层计算梯度的过程，是深度学习模型参数更新的核心步骤。对于逻辑回归，反向传播的过程已包含在上述梯度计算中；对于深层网络，反向传播会逐层传递梯度信号。

---

## 二、深层神经网络
### 2.1 深层网络的基本结构
深层神经网络包含输入层、多个隐藏层和输出层，每层神经元通过激活函数引入非线性，使模型能学习复杂的特征映射。

#### 核心概念
- 层数定义：L层网络包含L-1个隐藏层 + 1个输出层
- 前向传播递推：对于第\(l\)层，\(Z^{[l]} = W^{[l]}A^{[l-1]} + b^{[l]}\)，\(A^{[l]} = g^{[l]}(Z^{[l]})\)，其中\(g^{[l]}\)为第\(l\)层的激活函数，\(A^{[0]} = X\)为输入

#### Python代码实现（L层网络前向传播）
```python
def initialize_parameters_deep(layer_dims):
    """初始化深层网络的权重和偏置"""
    parameters = {}
    L = len(layer_dims)  # 网络总层数（含输入层）
    
    for l in range(1, L):
        parameters[f"W{l}"] = np.random.randn(layer_dims[l], layer_dims[l-1]) * 0.01
        parameters[f"b{l}"] = np.zeros((layer_dims[l], 1))
    return parameters

def linear_activation_forward(A_prev, W, b, activation):
    """单一层的线性变换+激活函数"""
    Z = np.dot(W, A_prev) + b
    if activation == "sigmoid":
        A = sigmoid(Z)
    elif activation == "relu":
        A = np.maximum(0, Z)  # ReLU激活函数
    return A, (Z, A_prev, W, b)  # 缓存中间结果，用于反向传播

def L_model_forward(X, parameters):
    """L层网络的完整前向传播"""
    caches = []
    A = X
    L = len(parameters) // 2  # 网络的隐藏层+输出层数量
    
    # 前L-1层使用ReLU激活
    for l in range(1, L):
        A_prev = A
        A, cache = linear_activation_forward(A_prev, parameters[f"W{l}"], parameters[f"b{l}"], activation="relu")
        caches.append(cache)
    
    # 输出层使用Sigmoid激活（二分类任务）
    AL, cache = linear_activation_forward(A, parameters[f"W{L}"], parameters[f"b{L}"], activation="sigmoid")
    caches.append(cache)
    return AL, caches
```

### 2.2 常用激活函数
不同激活函数的特性直接影响模型的训练效率和表达能力，常见激活函数对比：

| 激活函数 | 公式 | 优点 | 缺点 | 代码实现 |
| --- | --- | --- | --- | --- |
| Sigmoid | \(\sigma(z) = \frac{1}{1+e^{-z}}\) | 输出在(0,1)，可表示概率 | 易出现梯度消失，输出非零均值 | `def sigmoid(z): return 1/(1+np.exp(-z))` |
| Tanh | \(\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}\) | 输出零均值，缓解Sigmoid的部分问题 | 仍易梯度消失 | `def tanh(z): return np.tanh(z)` |
| ReLU | \(ReLU(z) = \max(0, z)\) | 解决梯度消失问题，计算高效 | 部分神经元可能永久失活 | `def relu(z): return np.maximum(0, z)` |
| Leaky ReLU | \(LeakyReLU(z) = \max(\alpha z, z)\) | 解决ReLU的神经元失活问题 | 引入额外超参数\(\alpha\) | `def leaky_relu(z, alpha=0.01): return np.maximum(alpha*z, z)` |

### 2.3 深层网络的反向传播
反向传播通过链式法则逐层计算梯度，核心是根据前向传播的缓存结果，递推计算每层的\(\frac{\partial J}{\partial W^{[l]}}\)和\(\frac{\partial J}{\partial b^{[l]}}\)。

#### Python代码实现（L层网络反向传播）
```python
def linear_activation_backward(dA, cache, activation):
    """单一层的反向传播（激活函数梯度+线性变换梯度）"""
    Z, A_prev, W, b = cache
    m = A_prev.shape[1]
    
    if activation == "sigmoid":
        dZ = dA * sigmoid(Z) * (1 - sigmoid(Z))
    elif activation == "relu":
        dZ = np.array(dA, copy=True)
        dZ[Z <= 0] = 0  # ReLU导数：Z>0时为1，Z<=0时为0
    
    dW = 1/m * np.dot(dZ, A_prev.T)
    db = 1/m * np.sum(dZ, axis=1, keepdims=True)
    dA_prev = np.dot(W.T, dZ)
    return dA_prev, dW, db

def L_model_backward(AL, Y, caches):
    """L层网络的完整反向传播"""
    grads = {}
    L = len(caches)
    m = AL.shape[1]
    Y = Y.reshape(AL.shape)
    
    # 输出层初始梯度
    dAL = - (np.divide(Y, AL) - np.divide(1 - Y, 1 - AL))
    
    # 输出层反向传播（Sigmoid激活）
    current_cache = caches[-1]
    grads[f"dA{L-1}"], grads[f"dW{L}"], grads[f"db{L}"] = linear_activation_backward(dAL, current_cache, activation="sigmoid")
    
    # 隐藏层反向传播（ReLU激活）
    for l in reversed(range(L-1)):
        current_cache = caches[l]
        dA_prev_temp, dW_temp, db_temp = linear_activation_backward(grads[f"dA{l+1}"], current_cache, activation="relu")
        grads[f"dA{l}"] = dA_prev_temp
        grads[f"dW{l+1}"] = dW_temp
        grads[f"db{l+1}"] = db_temp
    return grads
```

---

## 三、卷积神经网络（CNN）
卷积神经网络通过卷积、池化等操作提取空间特征，是计算机视觉任务的核心模型。

### 3.1 卷积操作
卷积操作通过滑动卷积核（Filter）对输入特征图进行局部加权求和，提取局部空间特征。

#### 核心参数
- 卷积核大小（f）：通常为3x3、5x5
- 步幅（s）：卷积核每次滑动的像素数
- 填充（p）：在输入特征图边缘补零，保持输出尺寸与输入一致

#### Python代码实现（Numpy手动实现卷积）
```python
def conv_single_step(a_slice_prev, W, b):
    """单步卷积计算"""
    s = np.multiply(a_slice_prev, W)
    Z = np.sum(s) + float(b)
    return Z

def conv_forward(A_prev, W, b, hparameters):
    """多通道输入的卷积前向传播"""
    (m, n_H_prev, n_W_prev, n_C_prev) = A_prev.shape
    (f, f, n_C_prev, n_C) = W.shape
    stride = hparameters["stride"]
    pad = hparameters["pad"]
    
    # 计算输出尺寸
    n_H = int((n_H_prev - f + 2*pad) / stride) + 1
    n_W = int((n_W_prev - f + 2*pad) / stride) + 1
    
    # 初始化输出特征图
    Z = np.zeros((m, n_H, n_W, n_C))
    A_prev_pad = np.pad(A_prev, ((0,0), (pad,pad), (pad,pad), (0,0)), mode='constant')
    
    for i in range(m):
        a_prev_pad = A_prev_pad[i]
        for h in range(n_H):
            for w in range(n_W):
                for c in range(n_C):
                    # 定位当前卷积窗口
                    vert_start = h * stride
                    vert_end = vert_start + f
                    horiz_start = w * stride
                    horiz_end = horiz_start + f
                    a_slice_prev = a_prev_pad[vert_start:vert_end, horiz_start:horiz_end, :]
                    Z[i, h, w, c] = conv_single_step(a_slice_prev, W[...,c], b[...,c])
    return Z
```

### 3.2 池化层
池化层用于降低特征图的空间尺寸，减少计算量，同时保留关键特征。常见类型为最大池化和平均池化。

#### Python代码实现
```python
def pool_forward(A_prev, hparameters, mode="max"):
    """池化层前向传播"""
    (m, n_H_prev, n_W_prev, n_C_prev) = A_prev.shape
    f = hparameters["f"]
    stride = hparameters["stride"]
    
    n_H = int((n_H_prev - f) / stride) + 1
    n_W = int((n_W_prev - f) / stride) + 1
    n_C = n_C_prev
    
    A = np.zeros((m, n_H, n_W, n_C))
    
    for i in range(m):
        for h in range(n_H):
            for w in range(n_W):
                for c in range(n_C):
                    vert_start = h * stride
                    vert_end = vert_start + f
                    horiz_start = w * stride
                    horiz_end = horiz_start + f
                    
                    a_slice_prev = A_prev[i, vert_start:vert_end, horiz_start:horiz_end, c]
                    if mode == "max":
                        A[i, h, w, c] = np.max(a_slice_prev)
                    elif mode == "average":
                        A[i, h, w, c] = np.mean(a_slice_prev)
    return A
```

### 3.3 典型CNN架构实现（PyTorch）
以ResNet的残差模块为例，残差连接解决了深层网络的梯度消失问题：

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels, stride=1):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        
        # 捷径连接：当输入输出通道数不同或步幅不为1时，用1x1卷积调整
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )
    
    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)
        out = F.relu(out)
        return out

# 构建简单的ResNet18
class ResNet(nn.Module):
    def __init__(self, block, num_blocks, num_classes=10):
        super(ResNet, self).__init__()
        self.in_channels = 64
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(64)
        self.layer1 = self._make_layer(block, 64, num_blocks[0], stride=1)
        self.layer2 = self._make_layer(block, 128, num_blocks[1], stride=2)
        self.layer3 = self._make_layer(block, 256, num_blocks[2], stride=2)
        self.layer4 = self._make_layer(block, 512, num_blocks[3], stride=2)
        self.avg_pool = nn.AdaptiveAvgPool2d((1,1))
        self.fc = nn.Linear(512, num_classes)
    
    def _make_layer(self, block, out_channels, num_blocks, stride):
        strides = [stride] + [1]*(num_blocks-1)
        layers = []
        for stride in strides:
            layers.append(block(self.in_channels, out_channels, stride))
            self.in_channels = out_channels
        return nn.Sequential(*layers)
    
    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.layer1(out)
        out = self.layer2(out)
        out = self.layer3(out)
        out = self.layer4(out)
        out = self.avg_pool(out)
        out = out.view(out.size(0), -1)
        out = self.fc(out)
        return out

# 实例化ResNet18
def ResNet18(num_classes=10):
    return ResNet(ResidualBlock, [2,2,2,2], num_classes)
```

---

## 四、循环神经网络（RNN）与序列模型
循环神经网络专门用于处理序列数据，通过循环单元保留上下文信息。

### 4.1 基础RNN结构
基础RNN的循环单元会接收当前输入和上一时刻的隐藏状态，输出当前隐藏状态和预测结果。

#### 核心公式
- 隐藏状态更新：\(h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)\)
- 输出计算：\(y_t = W_{hy} h_t + b_y\)

#### Python代码实现（Numpy）
```python
def softmax(x):
    """Softmax激活函数"""
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=0)

def rnn_cell_forward(xt, a_prev, parameters):
    """单步RNN单元前向传播"""
    Wax = parameters["Wax"]
    Waa = parameters["Waa"]
    Wya = parameters["Wya"]
    ba = parameters["ba"]
    by = parameters["by"]
    
    a_next = np.tanh(np.dot(Wax, xt) + np.dot(Waa, a_prev) + ba)
    yt_pred = softmax(np.dot(Wya, a_next) + by)  # softmax用于多分类输出
    return a_next, yt_pred

def rnn_forward(x, a0, parameters):
    """完整序列的RNN前向传播"""
    (n_x, m, T_x) = x.shape
    (n_a, m) = a0.shape
    n_y = parameters["Wya"].shape[0]
    
    # 初始化隐藏状态和输出缓存
    a = np.zeros((n_a, m, T_x))
    y_pred = np.zeros((n_y, m, T_x))
    a_next = a0
    
    for t in range(T_x):
        a_next, yt_pred = rnn_cell_forward(x[:,:,t], a_next, parameters)
        a[:,:,t] = a_next
        y_pred[:,:,t] = yt_pred
    return a, y_pred
```

### 4.2 LSTM单元实现（PyTorch）
LSTM通过遗忘门、输入门、输出门精准控制上下文信息的流动，解决了基础RNN的长期依赖问题：

```python
class LSTMCell(nn.Module):
    def __init__(self, input_size, hidden_size):
        super(LSTMCell, self).__init__()
        self.hidden_size = hidden_size
        # 合并所有门的权重矩阵，减少计算量
        self.fc = nn.Linear(input_size + hidden_size, 4 * hidden_size)
    
    def forward(self, x, hidden):
        h_prev, c_prev = hidden
        combined = torch.cat((x, h_prev), dim=1)
        gates = self.fc(combined)
        # 拆分四个门：遗忘门(f)、输入门(i)、候选细胞状态(g)、输出门(o)
        f, i, g, o = torch.chunk(gates, 4, dim=1)
        
        f = torch.sigmoid(f)
        i = torch.sigmoid(i)
        g = torch.tanh(g)
        o = torch.sigmoid(o)
        
        # 更新细胞状态
        c_next = f * c_prev + i * g
        # 更新隐藏状态
        h_next = o * torch.tanh(c_next)
        return h_next, c_next

# 简单的LSTM序列分类模型
class LSTMClassifier(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes, num_layers=1):
        super(LSTMClassifier, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, num_classes)
    
    def forward(self, x):
        # 初始化隐藏状态和细胞状态
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        # LSTM前向传播，输出为(output, (hn, cn))
        out, _ = self.lstm(x, (h0, c0))
        # 取最后一个时间步的隐藏状态用于分类
        out = self.fc(out[:, -1, :])
        return out
```

---

## 五、模型训练与调优
### 5.1 正则化方法
- Dropout：随机失活部分神经元，防止过拟合，PyTorch实现：`nn.Dropout(p=0.5)`
- L2正则化：在损失函数中加入权重平方项，PyTorch中通过优化器的`weight_decay`参数实现
- 数据增强：对输入数据进行随机变换（如图片翻转、裁剪），增加数据多样性

### 5.2 常见优化器对比
| 优化器 | 核心特点 | PyTorch实现 |
| --- | --- | --- |
| SGD | 基础梯度下降，学习率固定 | `torch.optim.SGD(model.parameters(), lr=0.01)` |
| Momentum | 引入动量，加速收敛，缓解震荡 | `torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)` |
| Adam | 自适应学习率，结合动量与RMSprop | `torch.optim.Adam(model.parameters(), lr=0.001)` |

### 5.3 训练循环示例（PyTorch）
```python
def train_model(model, train_loader, criterion, optimizer, num_epochs=10, device='cuda'):
    model.to(device)
    model.train()
    
    for epoch in range(num_epochs):
        running_loss = 0.0
        correct = 0
        total = 0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            # 前向传播
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            # 反向传播与优化
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            # 统计损失与准确率
            running_loss += loss.item() * inputs.size(0)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
        
        epoch_loss = running_loss / total
        epoch_acc = correct / total * 100
        print(f"Epoch {epoch+1}/{num_epochs}, Loss: {epoch_loss:.4f}, Accuracy: {epoch_acc:.2f}%")
```