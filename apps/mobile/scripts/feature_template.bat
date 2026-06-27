@echo off
REM feature_template.bat — Scaffold a Clean Architecture feature module (Windows)
REM Usage: scripts\feature_template.bat <feature_name>
REM Example: scripts\feature_template.bat auth

if "%1"=="" (
  echo Usage: %0 ^<feature_name^>
  exit /b 1
)

set FEATURE=%1
set BASE=lib\features\%FEATURE%

echo Scaffolding feature: %FEATURE%

if not exist "%BASE%" mkdir "%BASE%\presentation\screens"
if not exist "%BASE%" mkdir "%BASE%\presentation\bloc"
if not exist "%BASE%" mkdir "%BASE%\domain\entities"
if not exist "%BASE%" mkdir "%BASE%\domain\repositories"
if not exist "%BASE%" mkdir "%BASE%\domain\usecases"
if not exist "%BASE%" mkdir "%BASE%\data\repositories"
if not exist "%BASE%" mkdir "%BASE%\data\datasources"
if not exist "%BASE%" mkdir "%BASE%\data\models"

echo class %FEATURE%Entity { final String id; const %FEATURE%Entity({required this.id}); } > "%BASE%\domain\entities\%FEATURE%_entity.dart"
echo Done: %FEATURE% module scaffolded.
