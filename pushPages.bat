msbuild Fractactal\Fractactal.csproj /t:Rebuild /v:m
git add -f Fractactal\app.js
git stash --keep-index
git reset
git checkout gh-pages
rmdir Fractactal /s /q
git stash pop
git checkout master Fractactal\index.html
git checkout master Fractactal\app.css
git checkout master Fractactal\favicon.ico
del app.js app.css favicon.ico index.html
move Fractactal\* .
rmdir Fractactal
git add --all .
git commit -m "update gh-pages"
git push origin gh-pages
git checkout master
