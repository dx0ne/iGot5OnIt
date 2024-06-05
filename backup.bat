```batch
@echo off
setlocal

:: Get current date and time
for /F "tokens=2 delims==" %%I in ('"wmic os get localdatetime /value"') do set datetime=%%I
set datetime=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%

:: Create new folder with date and time
set newfolder=Backup_%datetime%
mkdir "%newfolder%"

:: Copy all files to the new folder (excluding other folders)
for %%f in (*) do (
    if not "%%~ff" == "%~f0" (
        copy "%%f" "%newfolder%"
    )
)

endlocal
echo All files have been copied to the folder: %newfolder%
pause
```