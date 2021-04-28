# minio 源码改造部署

[toc]

minio
编译linux版本 已完成
编译windows版本 已完成
编译docker版本  已完成
修改项目根路径
修改浏览器端 标题和右上角链接地址 图标等 已完成
修改minio java 客户端源码
修改JavaScript 客户端源码
文档整理

测试大文件上传和下载
测试文件拷贝
测试文件预览 支持多格式
测试文件合并
测试断点续传 上传和下载
测试文件快速压缩
测试文件快速解压
测试文件分享 + 二维码





## 开发环境：

- 必须是 Linux

```
yum install mercurial
yum install git
yum install gcc
```

- 下载go,  必须是 1.16

> https://golang.google.cn/dl/go1.16.3.linux-amd64.tar.gz

```sh
# 安装go
cd /usr/local/
tar -zxvf go1.16.3.linux-amd64.tar.gz

# 配置go工作空间 GOPATH
cd /home/
mkdir go
cd go/
mkdir bin
mkdir src
mkdir pkg

# 添加环境变量
[root@localhost go]# vi /etc/profile

export GOROOT=/usr/local/go        
export PATH=$GOROOT/bin:$PATH
export GOPATH=/home/go


[root@localhost go]# source /etc/profile  ##刷新环境变量
[root@localhost go]# go version       ##查看go版本  
go version go1.16.3 linux/amd64
[root@localhost go]# go env  ##查看Go语言的环境信息
[root@localhost go]# go env GOOS GOARCH
# 设置golang环境代理
[root@localhost go]# go env -w GOPROXY=https://goproxy.cn,direct
[root@localhost go]# go env -w GO111MODULE=on

# linux 默认
go env -w GOOS=linux
go env -w GOARCH=amd64
go env -w CGO_ENABLED=0
```

- linux 安装git ，并且需要防火墙开放443端口

```

```



#### 源码下载：

> 只能在linux上打包，不能在windwos上打包

```python
# 下拉代码
cd /home
git clone https://github.com/minio/minio
# 根据最新标签创建新分支进行开发
git checkout -b RELEASE.2021-04-22T15-44-28Z RELEASE.2021-04-22T15-44-28Z

# 下载依赖
cd /home/minio
go get
cd /home/minio/browser
npm install

# 编译打包,默认打包只能在linux上运行
cd /home/minio
make   # 编译打包
```



#### linux编译

```shell
# 默认linux
make
```

快速启动脚本-minio_start.sh

> chmod +x ./minio_start.sh
> ./minio_start.sh

```
#!/bin/bash

script_abs=$(readlink -f "$0")
CURRENT_DIR=$(dirname $script_abs)

./minio server ${CURRENT_DIR}/data
```

命令行启动

```
./minio server /data
```

#### linux上编译windwos可执行文件(minio.exe)

```shell
cd minio/
vim Makefile

# 新增支持在linux上编译windows可执行文件(minio.exe)
win: checks
        @echo "Building minio windwos exe to './minio.exe'"
        @GO111MODULE=on CGO_ENABLED=0 GOOS=windows go build -tags kqueue -trimpath --ldflags "$(LDFLAGS)" -o $(PWD)/minio.exe 1>/dev/null

#运行命令
make win
```
快速启动脚本-minio_start.bat

> 双击 minio_start.bat

```cmd
@echo off&title Minio-9000
@setlocal enableextensions
setlocal enabledelayedexpansion
@cd /d "%~dp0"

:: 当前目录
set CURRENT_DIR=%cd%

:: 默认租户 9000
minio.exe server %CURRENT_DIR%\data
```

#### linux上编译mac

```shell
cd minio/
vim Makefile

# 新增支持在linux上编译mac
mac: checks
        @echo "Building minio binary to './minio'"
        @GO111MODULE=on CGO_ENABLED=0 GOOS=darwin go build -tags kqueue -trimpath --ldflags "$(LDFLAGS)" -o $(PWD)/minio 1>/dev/null

#运行命令
make mac
```

#### linux上编译docker镜像

```shell
cd minio/
make docker

docker images
REPOSITORY                                    TAG                            IMAGE ID
minio/minio                                   RELEASE.2021-04-22T15-44-28Z   f8a20ad34fa5 

docker run -p 9000:9000 minio/minio:RELEASE.2021-04-22T15-44-28Z server /data
docker ps -a
```

> 以上会有异常: go: cloud.google.com/go@v0.39.0: Get "https://proxy.golang.org/cloud.google.com/go/@v/v0.39.0.mod": dial tcp 172.217.160.81:443: connect: connection refused

```shell
# 进入golang:latest容器
docker exec -it 70fe658abafa /bin

# 修改代理
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GO111MODULE=on
```

```shell
#继续执行
docker build -f Dockerfile -t minio:v1 .
```

>fatal: unable to access 'https://github.com/minio/minio/': OpenSSL SSL_read: Connection reset by peer, errno 104
>The command '/bin/sh -c apk add --no-cache git &&      git clone https://github.com/minio/minio && cd minio &&      git checkout master && go install -v -ldflags "$(go run buildscripts/gen-ldflags.go)"' returned a non-zero code: 128



#### 源码修改：

```python
# 修改标题
vim browser/app/index.html
# 修改浏览器标题
vim browser/app/js/browser/SideBar.js
# 修改主页显示的内容(标题、右侧栏)，主要移除minio相关的内容，替换成公司的内容
vim browser/production/index_bundle.js
# 修改浏览器状态标题
vim browser/production/index.html   

```





