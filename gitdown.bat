@echo off
REM Change to the directory where this script is located
cd /d %~dp0

REM Check if the .git directory exists to ensure it's a git repository
if exist .git (
    REM Fetch the latest changes from the remote repository
    git fetch origin

    REM Pull the latest changes from the remote repository
    git pull origin master
) else (
    echo "This directory is not a git repository."
)
