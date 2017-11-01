const cheerio = require('cheerio')

var request = require('request')
var cookieJar = request.jar()
request = request.defaults({
    jar: cookieJar
})

const jsdom = require('jsdom')
const {
    JSDOM
} = jsdom

const Queue = require('promise-queue')

module.exports = class LoginCrawler {

    /*
    options parameter currently takes an object containing the following :
    {
        maxConnections : .. // Number of crawls made asynchronously at a time.
    }
    */
    constructor(options) {
        this.maxConnections = options.maxConnections
        this.isDebug = options.isDebug
        this.queue = new Queue(options.maxConnections, Infinity)
    }

    /*
    Queue an url to be fastly crawled.
    */
    fastQueue(url) {
        return this.queue.add(() => {
            return this.fastLoad(url)
        })
    }


    /*
    Queue an url to be slowly crawled.
    */
    slowQueue(url, waitMilliseconds) {
        return this.queue.add(() => {
            return this.slowLoad(url, waitMilliseconds)
        })
    }

    /*
    Simple load of the url via http request. Ignores asynchronous resources such as scripts and iframes.
    Returns a promise for object containing :
        the response, body, and body loaded onto cheerio.
    */
    fastLoad(url) {

        return new Promise((resolve, reject) => {
            request({
                url: url
            }, function (err, response, body) {
                if (err) {
                    reject(err)
                }

                resolve({
                    response: response,
                    body: body,
                    $: cheerio.load(body)
                })
            })
        })
    }

    /*
    Load the given url using jsdom. Waits waitMilliseconds for all resources to load.
    Having said, it's potentially dangerous. Returns a promise for object containing : 
        body, and body loaded onto cheerio.
    */
    slowLoad(url, waitMilliseconds) {

        return new Promise((resolve, reject) => {
            let jar = cookieJar._jar

            JSDOM.fromURL(url, {
                resources: 'usable',
                runScripts: "dangerously", 
                cookieJar: jar
            }).then(dom => {
                setTimeout(() => {

                    let body = dom.serialize()

                    resolve({
                        body: body,
                        $: cheerio.load(body)
                    })
                }, waitMilliseconds)
            }, err => {
                reject(err)
            })
        })
    }

    /*
    Log in via basic access authentication. 
    authInfo looks something like this :
    {
        // (The name of the keys should match the login POST data format)
        user_id: 'username',
        password: 'password'
    }
    Subsequent requests made by the crawler will contain the resulting cookie.
    Returns the cookie jar. 
    */

    basicLogin(loginUrl, authInfo) {

        return new Promise((resolve, reject) => {

            request.post(loginUrl, {
                form: authInfo
            }, (err, response, body) => {
                if (err)
                    reject(err)

                resolve(this.getCookieJar())
            })
        })
    }

    /*
    Get the tough-cookie jar.
    */
    getCookieJar() {
        return cookieJar._jar
    }

    /*
    Set the tough-cookie jar.
    */
    setCookieJar(jar) {
        cookieJar._jar = jar
    }

    /*
    Store a cookie in the tough-cookie jar. Refer to:
    https://www.npmjs.com/package/tough-cookie#setcookiecookieorstring-currenturl-options-cberrcookie
    */
    addCookie(cookieOrString, currentUrl, options, cb) {
        cookieJar._jar.setCookie(cookieOrString, currentUrl, options, cb)
    }
}