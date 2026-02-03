#!/bin/bash
# LibreChat迁移脚本：移除New-API，启用内置余额系统
# 使用方法：在服务器上运行此脚本

set -e  # 遇到错误立即退出

echo "=========================================="
echo "LibreChat 迁移到内置余额系统"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在LibreChat目录
if [ ! -f "librechat.yaml" ]; then
    echo -e "${RED}错误：未找到librechat.yaml，请确保在LibreChat目录下运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤1：备份当前配置...${NC}"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
cp librechat.yaml "librechat.yaml.backup.$BACKUP_DATE"
cp .env ".env.backup.$BACKUP_DATE"
echo -e "${GREEN}✓ 配置已备份到 .backup.$BACKUP_DATE${NC}"
echo ""

echo -e "${YELLOW}步骤2：停止New-API服务...${NC}"
if docker ps | grep -q "new-api"; then
    echo "发现运行中的New-API容器，正在停止..."
    docker stop new-api || true
    docker rm new-api || true
    echo -e "${GREEN}✓ New-API已停止${NC}"
else
    echo "未发现运行中的New-API容器"
fi
echo ""

echo -e "${YELLOW}步骤3：更新librechat.yaml配置...${NC}"
# 检查是否已有balance配置
if grep -q "^balance:" librechat.yaml; then
    echo "发现已有balance配置，跳过添加"
else
    cat >> librechat.yaml << 'EOF'

# 余额系统配置
# 说明：1000 tokenCredits = $0.001 USD
balance:
  enabled: true
  startBalance: 1000000      # 新用户$1初始余额
  autoRefillEnabled: true
  refillIntervalValue: 30
  refillIntervalUnit: 'days'
  refillAmount: 500000       # 每月自动充值$0.50

transactions:
  enabled: true
EOF
    echo -e "${GREEN}✓ 余额配置已添加到librechat.yaml${NC}"
fi
echo ""

echo -e "${YELLOW}步骤4：清理.env中的New-API配置...${NC}"
# 注释掉New-API相关配置
sed -i 's/^NEW_API_BASE_URL=/#NEW_API_BASE_URL=/g' .env
sed -i 's/^NEW_API_PUBLIC_URL=/#NEW_API_PUBLIC_URL=/g' .env
sed -i 's/^NEW_API_ADMIN_TOKEN=/#NEW_API_ADMIN_TOKEN=/g' .env
sed -i 's/^NEW_API_GIFT_QUOTA=/#NEW_API_GIFT_QUOTA=/g' .env
sed -i 's/^NEW_API_QUOTA_PER_DOLLAR=/#NEW_API_QUOTA_PER_DOLLAR=/g' .env
sed -i 's|^OPENAI_REVERSE_PROXY=http://new-api:3000/v1|#OPENAI_REVERSE_PROXY=http://new-api:3000/v1|g' .env
sed -i 's/^HIDE_USER_API_KEY=1/#HIDE_USER_API_KEY=1/g' .env
echo -e "${GREEN}✓ New-API配置已注释${NC}"
echo ""

echo -e "${YELLOW}步骤5：重启LibreChat服务...${NC}"
docker compose restart api
echo -e "${GREEN}✓ LibreChat正在重启...${NC}"
echo ""

echo "等待服务启动（10秒）..."
sleep 10

echo -e "${YELLOW}步骤6：检查服务状态...${NC}"
docker compose ps api
echo ""

echo -e "${GREEN}=========================================="
echo "迁移完成！"
echo "==========================================${NC}"
echo ""
echo "📝 后续操作："
echo "1. 查看日志：docker compose logs -f api"
echo "2. 创建用户：docker exec LibreChat npm run create-user"
echo "3. 充值余额：docker exec LibreChat npm run add-balance <email> <amount>"
echo "4. 查看余额：docker exec LibreChat npm run list-balances"
echo ""
echo "💾 备份文件："
echo "- librechat.yaml.backup.$BACKUP_DATE"
echo "- .env.backup.$BACKUP_DATE"
echo ""
echo "如需回滚："
echo "cp librechat.yaml.backup.$BACKUP_DATE librechat.yaml"
echo "cp .env.backup.$BACKUP_DATE .env"
echo "docker compose restart api"
