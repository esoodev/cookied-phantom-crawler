const cheerio = require('cheerio')
const phantom = require('phantom')
const {
    URL
} = require('url')

var cookieConverter = require('parse-cookie-phantomjs')

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

module.exports = class Crawler {

    /*
    options parameter currently takes an object containing the following :
    {
        maxConnections : .. // Number of crawls made asynchronously at a time.
    }
    */
    constructor(options) {
        this.maxConnections = options.maxConnections
        this.queue = new Queue(options.maxConnections, Infinity)
    }

    /*
    Fully load page using PhantomJS
    */
    async phantomLoad(url) {

        try {
            const instance = await phantom.create()
            const page = await instance.createPage()
            const origin = new URL(url).origin

            this._phantomAddCookiesToPage(this._getCookiesPhantom(origin), page)

            // await page.on("onResourceRequested", function (requestData) {
            //     //console.info('Requesting', requestData.url)
            // })

            const status = await page.open(url)
            const content = await page.property('content')

            instance.exit()

            return new Promise((resolve, reject) => {
                resolve({
                    body: content,
                    $: cheerio.load(content)
                })
            })
        } catch (err) {
            return new Promise((resolve, reject) => {
                reject(err)
            })
        }

    }

    /*
    Queue an url to be crawled via Phantom.
    */
    phantomQueue(url) {
        return this.queue.add(() => {
            return this.phantomLoad(url)
        })
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
            let jar = cookieJar._jar

            JSDOM.fromURL(url, {
                resources: 'usable',
                runScripts: "dangerously",
                cookieJar: jar
            }).then(dom => {

                let body = dom.serialize()

                resolve({
                    body: body,
                    $: cheerio.load(body)
                })
            }, err => {
                reject(err)
            })
        })
    }

    /*
    Load the given url using jsdom. Waits waitMilliseconds for all resources to load.
    Having said, it's potentially dangerous. Returns a promise for object containing : 
    body, and body loaded onto cheerio.
    */
    timedLoad(url, waitMilliseconds) {

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
        return cookieJar
    }

    /*
    Set the tough-cookie jar.
    */
    setCookieJar(jar) {
        cookieJar = jar
    }

    /*
    Get an array of cookies held at the moment belonging to a particular url.
    Refer to :
    https://www.npmjs.com/package/tough-cookie#setcookiecookieorstring-currenturl-options-cberrcookie
    for info regarding second and third parameters.
    */
    getCookieStrings(url, options, cb) {
        let cookieStrings = this.getCookieJar().getCookies(url, options, cb).map((cookie) => {
            return cookie.toString()
        })
        return cookieStrings
    }

    /*
    Store a cookie in the cookie jar. 
    Refer to:
    https://www.npmjs.com/package/tough-cookie#setcookiecookieorstring-currenturl-options-cberrcookie
    for info regarding third and fourth parameters.
    */
    addCookie(cookieOrString, currentUrl, options, cb) {
        cookieJar.setCookie(cookieOrString, currentUrl, options, cb)
    }


    /*
    Add PhantomCookies.
    */
    _phantomAddCookiesToPage(phantomCookies, page) {
        phantomCookies.forEach((phantomCookie) => {
            //console.log('Adding a cookie to Phantom.')

            if (page.addCookie(phantomCookie)) {
                //console.log('Successfully added a cookie to Phantom.')
            } else
                console.log('Failed adding a cookie to Phantom.')
        })
    }

    /*
    Get an array of phantom cookies belonging to a url from the shared tough-cookie jar.
    */
    _getCookiesPhantom(url, options, cb) {
        let cookieStrings = this.getCookieStrings(url, options, cb)
        let cookiesPhantom = cookieStrings.map((string) => {
            return cookieConverter(string)
        })
        return cookiesPhantom
    }
}