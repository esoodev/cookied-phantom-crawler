# cookied-phantom-crawler
PhantomJS and JSDOM based crawling tool.
Used PhantomJS for full load of asynchronously-loaded resources and JSDOM for quick crawls.
Allows custom [tough-cookie](https://www.npmjs.com/package/tough-cookie) insertion.
Refer to [cheerio](https://www.npmjs.com/package/cheerio) for selecting elements in the DOM.
Also implements a login method for crawling through pages that make use of form-based authentication.


##Usage Examples


### Instantiation
```
var Crawler = require('./cookied-phantom-crawler')

var crawler = new Crawler({
    /*
    Currently the only option available. Indicates the number of concurrent
    connections made for crawling.
    */
    maxConnections: 10  
})
```

### Form-based login.
```
async function login() {
    try {
        await crawler.basicLogin('https://slrclub.com/login/process.php', {

            // The name of the keys and their values should be the same as 
            // those expected in the POST request.

            user_id: 'user',   
            password: 'password'
        })
    } catch (error) {

        // Handle errors here.
    }
}
```

### Full load of page using PhantomJS.
```
crawler.phantomQueue(url).then((res) => {

    console.log(res.$('.sbj').text())   // '$' is cheerio.
    console.log(res.body)               // Raw body.
}, (err) => {

    // Handle error here.
})
```

### Fast load of page using JSDOM.
```
crawler.fastQueue(url).then((res) => {

    console.log(res.$('.sbj').text())   // '$' is cheerio.
    console.log(res.body)               // Raw body.
}, (err) => {

    // Handle error here.
})
```

### Timed load of page. Uses JSDOM and setTimeout.
```

/*
Waits waitMilliseconds for all resources to load indiscriminately.
Having said, it's potentially dangerous: only use on trusted pages.
*/

crawler.timedLoad(url, waitMilliseconds).then((res) => {

    console.log(res.$('.sbj').text())   // '$' is cheerio.
    console.log(res.body)               // Raw body.
}, (err) => {

    // Handle error here.
})
```

### Get the tough-cookie jar.
```
crawler.getCookieJar()
```

### Set the tough-cookie jar.
```
crawler.getCookieJar(jar)
```

### Store a cookie in the cookie jar.
Refer [here](https://www.npmjs.com/package/tough-cookie#setcookiecookieorstring-currenturl-options-cberrcookie) for info regarding the second and third parameters.
```
crawler.getCookieJar(jar)
```

### Get an array of cookie strings belonging to a particular url.
Refer [here](https://www.npmjs.com/package/tough-cookie#setcookiecookieorstring-currenturl-options-cberrcookie) for info regarding the second and third parameters.
```
let cookies = crawler.getCookieStrings(url, options, callback)
```



##Updates
###1.0.0
Release.


