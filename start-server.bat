@echo off
cd /d "%~dp0"
REM Start simple HTTP server using Node if available, else use Python
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Node HTTP server...
    node -e "const http=require('http'),fs=require('fs'),path=require('path');http.createServer((r,s)=>{let f=r.url==='/'?'/TCM Document Agent.html':r.url,p=path.join(__dirname,f);fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);s.end('404')}else{const ext={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jsx':'text/javascript'};s.writeHead(200,{'Content-Type':ext[path.extname(p)]||'application/octet-stream'});s.end(d)}})}).listen(8080,()=>console.log('http://localhost:8080'))"
) else (
    echo Node not found, trying python...
    python -m http.server 8080
)
