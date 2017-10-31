const qs = require('querystring')

var LoginCrawler = require('./login-crawler')
var crawler = new LoginCrawler(false)

const boardUrl = 'http://www.slrclub.com/bbs/zboard.php?'

const qsMarketForSale = {
    id: 'used_market',
    category: 1
}

const qsMarketForBuy = {
    id: 'used_market',
    category: 2
}

main()

async function main() {

    //crawler.ghostLoad()

    try {
        var loginCookie = await crawler.login('https://slrclub.com/login/process.php', {
            user_id: 'porpitas',
            password: 'h8erhate!'
        })
        //console.log(loginCookie)
    } catch (error) {
        console.log(error)
    }

    // try {
    //     var result = await crawler.fastLoad('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=8154109')
    //     //console.log(result)
    // } catch (error) {
    //     console.log(error)
    // }

    //console.log( crawler._getCookieJar('https://slrclub.com/') ) 
    console.log( await crawler.slowLoad('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=8154109', 2000))
    // console.log( crawler._getCookieJar('https://slrclub.com/') ) 

}

async function getPage() {

    try {
        var result = await crawler.load('https://www.slrclub.com/login/process.php')
    } catch (error) {
        console.log(error)
    }

    return result.body

}