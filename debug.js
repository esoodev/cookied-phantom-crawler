const qs = require('querystring')
var tough = require('tough-cookie')
var fs = require('fs')

var LoginCrawler = require('./login-crawler')
var crawler = new LoginCrawler({
    maxConnections: 10,
    isDebug: false
})

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

    await login()

    // crawler.fastQueue('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=8154985').then((res) => {
    //     console.log(res.$('.sbj').text() + '\n')
    // })

    // for (let i = 8154985; i <= 8155013; i++) {
    //     crawler.slowQueue('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=' + i, 2000).then((res) => {
    //         //console.log('post ' + i + ' : ' + res.$('.sbj').text())
    //         console.log(res.body)
    //     }, (err) => {
    //         console.log(err)
    //     })
    // }

    var stream = fs.createWriteStream(__dirname + '/test.html');

    stream.once('open', function (fd) {
        for (var i = 8155746; i <= 8155746; i++) {
            crawler.slowQueue('http://www.slrclub.com/bbs/vx2.php?id=used_market&category=1&no=' + i, 2000).then((res) => {

                let $ = res.$

                // $('.cmt-contents').each(
                //     (index) => {
                //         console.log(index + ": " + this.text())
                //     }
                // )

                try {
                    $('.cmt-contents').each(function (i, elem) {
                        console.log($(this).text())
                    });
                } catch (error) {

                }
                stream.write()
                // stream.write(
                //     'post ' + i + ' : ' + res.$('.sbj').text()+'\n'
                //     + ''
                // )
                //console.log(res)
            }, (err) => {
                console.log(err)
            })
        }
    })

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