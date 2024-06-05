@echo off

md myapp

echo"<!DOCTYPE html>" >> myapp\index.html
echo<html lang="en"> >> myapp\index.html
echo<head> >> myapp\index.html
echo  <meta charset="UTF-8"> >> myapp\index.html
echo  <title>My Sample App</title> >> myapp\index.html
echo</head> >> myapp\index.html
echo<body> >> myapp\index.html
echo  <h1>Welcome to My App!</h1> >> myapp\index.html
echo  <script src="script.js"></script> >> myapp\index.html
echo</body> >> myapp\index.html
echo</html> >> myapp\index.html

echo /* Basic CSS styles */ > myapp\style.css
echo body { >> myapp\style.css
echo  font-family: sans-serif;
echo} >> myapp\style.html

echo console.log("Hello from JavaScript!"); > myapp\script.js

echo All files created successfully!

pause
