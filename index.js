const AV = require('leancloud-storage')
const wilddog = require('wilddog')

var APP_ID = 'Ir6SE0GwBzFxczMqXXVpCF8d-gzGzoHsz';
var APP_KEY = 'SnlgtrRYvxJimSYDRw2GBr6H';

AV.init({
    appId: APP_ID,
    appKey: APP_KEY
});

var config = {
    syncURL: "https://ihoey.wilddogio.com" //输入节点 URL
};
wilddog.initializeApp(config);
var ref = wilddog.sync().ref('comments');
var user = wilddog.sync().ref('users');
var userData = {}

user.once("value", res => {
    userData = res.val()
});

ref.on("value", res => {
    console.log(`一共${Object.keys(res.val()).length}条`);
    Object.keys(res.val()).forEach((e, i) => {
        setTimeout(() => {
            add(res.val()[e])
            console.log(`第${i}条`);
        }, 100 * i);
    })
});

// setting access
let getAcl = () => {
    let acl = new AV.ACL();
    acl.setPublicReadAccess(!0);
    acl.setPublicWriteAccess(!1);
    return acl;
}

const add = (e) => {
    let Todo = AV.Object.extend('Comment');
    let todo = new Todo();

    let url = new Buffer(e.pageURL || e.rootCommentPageURL, 'base64').toString() || ''
    let nick = getNick(e, 'nick')
    let ua = getUa(e)
    let mail = getNick(e, 'mail')
    let domin = 'https://blog.ihoey.com'

    todo.set('nick', nick);
    todo.set('ip', e.ip || '');
    todo.set('mail', mail);
    todo.set('ua', ua);
    todo.set('pin', 0);
    todo.set('link', domin);
    todo.set('like', 0);
    todo.set('comment', `<p>${e.content}</p>`);
    todo.set('url', url.replace(/index\.(html|htm)/, '').replace(domin, ''));

    todo.setACL(getAcl());
    todo.save().then(todo => {
        console.log('New: ' + todo.id);
    }, error => {
        console.error('Failed: ' + error.message);
    });
}

//为了保持数据统一，随机给评论添加ua
const getUa = (e) => {
    let ua = ['Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
        'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50',
        'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0.1) Gecko/20100101 Firefox/4.0.1',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_0) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11',
        'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; SE 2.X MetaSr 1.0; SE 2.X MetaSr 1.0; .NET CLR 2.0.50727; SE 2.X MetaSr 1.0)',
        'Mozilla/5.0 (Linux; U; Android 2.2; en-gb; GT-P1000 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
        'Mozilla/5.0 (Linux; U; Android 4.0.4; en-gb; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        'Mozilla/5.0 (Linux; Android 4.1.1; Nexus 7 Build/JRO03D) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166  Safari/535.19'
    ]
    return ua[Math.floor(Math.random() * ua.length)]
}

const getNick = (e, type) => {
    let uid = e.uid || e.rootCommentUid
    if (type == 'nick') {
        if (uid != 'Anonymous' && userData[uid]) {
            return userData[uid].displayName
        } else {
            return 'Guest'
        }
    } else {
        if (uid != 'Anonymous' && userData[uid]) {
            return userData[uid].email
        } else {
            return ''
        }
    }
}
