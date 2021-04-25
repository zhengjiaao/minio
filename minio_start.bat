@echo off&title Minio-9000
@setlocal enableextensions
setlocal enabledelayedexpansion
@cd /d "%~dp0"

:: windows 默认启动 ./minio_start.bat

:: 当前目录
set CURRENT_DIR=%cd%

:: 默认租户 9000
minio.exe server %CURRENT_DIR%\data
