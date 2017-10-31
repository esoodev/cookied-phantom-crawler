const EventEmitter = require('events')

var request = require('request')
const cookieJar = request.jar()
request = request.defaults({
    jar: cookieJar
})

const jsdom = require('jsdom')
const {
    JSDOM
} = jsdom

const Queue = require('promise-queue')

module.exports = class LoginCrawler {

    constructor(options) {
        this.maxConnections = options.maxConnections
        this.isDebug = options.isDebug
        this.queue = new Queue(options.maxConnections, Infinity)
    }

    /*
    
    */
    fastQueue() {

    }


    /*

    */
    slowQueue() {
        return this.queue.add(() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve('done')
                }, 2000);
            })
        })
    }

    /*
    Simple load of the url via http request. Ignores scripts, iframes and such. 
    Returns a promise for an object containing the response and body.
    Optional callback onSuccess that takes body and response SEPARATELY as parameters, 
    and onError that takes err object as a parameter.
    */
    fastLoad(url, onSuccess, onError) {

        return new Promise((resolve, reject) => {
            request({
                url: url
            }, function (err, response, body) {
                if (err) {
                    onError(err)
                    reject(err)
                }

                onSuccess(response, body)
                resolve({
                    response: response,
                    body: body
                })
            })
        })
    }

    /*
    Load of the url using jsdom. Waits waitMilliseconds for the scripts and such to run.
    Potentially dangerous. Returns a promise for the page content.
    Optional callback onSuccess that takes body and response SEPARATELY as parameters, 
    and onError that takes err object as a parameter.
    */
    slowLoad(url, waitMilliseconds, onSuccess, onError) {

        return new Promise((resolve, reject) => {
            let jar = cookieJar._jar

            JSDOM.fromURL(url, {
                resources: 'usable',
                runScripts: "dangerously",
                cookieJar: jar
            }).then(dom => {
                setTimeout(() => {
                    resolve(dom.serialize())
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
    Returns a Promise for an array of cookies. 
    */

    login(loginUrl, authInfo) {

        return new Promise((resolve, reject) => {

            request.post(loginUrl, {
                form: authInfo
            }, (err, response, body) => {
                if (err)
                    reject(err)

                resolve(response.caseless.dict['set-cookie'])
            })
        })
    }

    /*
    Returns the cookie jar.
    */
    _getCookieJar(loginUrl, authInfo) {

        return cookieJar
    }

}