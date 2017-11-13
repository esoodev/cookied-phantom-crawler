const qs = require('querystring')
var tough = require('tough-cookie')
var fs = require('fs')

var Crawler = require('./cookied-phantom-crawler')
var crawler = new Crawler({
    maxConnections: 10,
    isDebug: false
})

const boardUrl = 'http://www.slrclub.com/bbs/zboard.php?'
const gboxUrl = 'http://gbox/community'

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

    await login()
    let jar = crawler.getCookieJar()
    //console.log(crawler._getCookiesPhantom('https://slrclub.com')) 
    //console.log( jar )
    //console.log(crawler.getCookieStrings('https://slrclub.com')) 

    // let content = await crawler.phantomLoad('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=8154985')
    // console.log(content) 

    for (let i = 8156971; i <= 8156996; i++) {
        crawler.phantomQueue('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=' + i, 2000).then((res) => {
            console.log('post ' + i + ' : ' + res.$('.sbj').text())
            //console.log(res.body)
        }, (err) => {
            console.log(err)
        })
    }

    crawler.phantomQueue('http://gbox/community/board/view/149365/122240').then((res) => {
        console.log(res)
        //console.log(res.body)
    }, (err) => {
        console.log(err)
    })

    crawler.fastQueue('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=8154985').then((res) => {
        console.log(res.$('.sbj').text() + '\n')
    })

    // for (let i = 8154985; i <= 8155013; i++) {
    //     crawler.slowQueue('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=' + i, 2000).then((res) => {
    //         //console.log('post ' + i + ' : ' + res.$('.sbj').text())
    //         console.log(res.body)
    //     }, (err) => {
    //         console.log(err)
    //     })
    // }

    // var stream = fs.createWriteStream(__dirname + '/test.html');

    // stream.once('open', function (fd) {
    //     for (var i = 8155746; i <= 8155746; i++) {
    //         crawler.slowQueue('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=' + i, 2000).then((res) => {

    //             let $ = res.$

    //             // $('.cmt-contents').each(
    //             //     (index) => {
    //             //         console.log(index + ": " + this.text())
    //             //     }
    //             // )

    //             try {
    //                 $('.cmt-contents').each(function (i, elem) {
    //                     console.log($(this).text())
    //                 });
    //             } catch (error) {

    //             }
    //             stream.write()
    //             // stream.write(
    //             //     'post ' + i + ' : ' + res.$('.sbj').text()+'\n'
    //             //     + ''
    //             // )
    //             //console.log(res)
    //         }, (err) => {
    //             console.log(err)
    //         })
    //     }
    // })

}

async function login() {
    try {
        await crawler.basicLogin('https://slrclub.com/login/process.php', {
            user_id: 'porpitas',
            password: 'h8erhate!'
        })
    } catch (error) {
        console.log(error)
    }
}