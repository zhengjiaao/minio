@echo off&title Minio-9000
@setlocal enableextensions
setlocal enabledelayedexpansion
@cd /d "%~dp0"

:: windows 默认启动 ./minio_start.bat

:: 当前目录
set CURRENT_DIR=%cd%

:: 配置用户/密码
set MINIO_ACCESS_KEY=username
set MINIO_SECRET_KEY=password

:: 默认租户 9000
minio.exe server %CURRENT_DIR%\data
