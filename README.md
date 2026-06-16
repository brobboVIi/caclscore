# CaclScore

四人对战积分系统 — React 19 + TypeScript + Tailwind CSS v4 (Vite)

## 规则

每局同时记录**奖金分配**和**胜负结果**：

- **奖金**：每人独立计数，每个奖金获得者 +3，其他三人各 −1，零和机制
- **胜负**：固定 2 胜 2 负，大胜 ±2，小胜 ±1
- **本局得分** = 奖金分 + 胜负分

## 开发

```bash
npm install     # 安装依赖
npm run dev     # 启动开发服务器
npm run build   # 类型检查 + 生产构建
npm run preview # 预览生产构建
```

## 技术栈

- React 19
- TypeScript
- Tailwind CSS v4
- Vite
- Lucide React (图标)
