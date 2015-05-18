msbuild Fractactal\Fractactal.csproj /t:Rebuild /v:m
copy Fractactal\index.html ..\fract-pages\index.html /Y
copy Fractactal\app.js ..\fract-pages\app.js /Y
copy Fractactal\app.css ..\fract-pages\app.css /Y
copy Fractactal\favicon.ico ..\fract-pages\favicon.ico /Y
pushd ..\fract-pages
git add --all .
git commit -m "update gh-pages"
git push origin gh-pages
popd
