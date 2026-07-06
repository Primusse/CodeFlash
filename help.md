  # backend
  docker build -t crpi-y4308sxmzzv810gc.cn-qingdao.personal.cr.aliyuncs.com/primusse/codeflash-backend:latest ./backend
  docker push crpi-y4308sxmzzv810gc.cn-qingdao.personal.cr.aliyuncs.com/primusse/codeflash-backend:latest

  # frontend (也要重建，因为加了导入页面)
  docker build -t crpi-y4308sxmzzv810gc.cn-qingdao.personal.cr.aliyuncs.com/primusse/codeflash-frontend:latest ./frontend
  docker push crpi-y4308sxmzzv810gc.cn-qingdao.personal.cr.aliyuncs.com/primusse/codeflash-frontend:latest

  服务器上：
  docker compose -f docker-compose.yml pull
  docker compose -f docker-compose.yml up -d



  ###打标签（本地和远程关联）
   docker tag crpi-y4308sxmzzv810gc.cn-qingdao.personal.cr.aliyuncs.com/codeflash-frontend:latest（本地） crpi-y4308sxmzzv810gc.cn-qingdao.personal.cr.aliyuncs.com/primusse/codeflash-frontend:latest（远程）