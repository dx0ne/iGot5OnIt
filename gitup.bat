@echo off
REM Change to the directory where this script is located
cd /d %~dp0

REM Initialize a new git repository if it doesn't exist
if not exist .git (
    git init
    git remote add origin https://github.com/dx0ne/iGot5OnIt.git
)

REM Add all changes to the staging area
git add .

REM Get the current date
for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set datetime=%%i
set commit_message=Commit on %datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%

REM Commit the changes with the current date
git commit -m "%commit_message%"

REM Push the changes to the remote repository
git push -u origin master
