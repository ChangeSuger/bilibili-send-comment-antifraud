// @ts-ignore isolatedModules
import { GM_xmlhttpRequest } from '$';

type Reply = {
  rpid: number;
  oid: number;
  type: number;
}

let originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null | undefined) {
  this.addEventListener('load', () => {
    if (this.readyState === 4 && this.status === 200 && this.responseURL.includes('https://api.bilibili.com/x/v2/reply/add')) {
      console.log('Bilibili reply add response:', this.response);
      let data = JSON.parse(this.response).data;
      let rpid: number = data.rpid;
      let oid: number = data.reply.oid;
      let type: number = data.reply.type;
      setTimeout(() => {
        // 抹除 cookie 获取最新评论列表第一页，再查找有没有该 rpid
        GM_xmlhttpRequest({
          method: 'GET',
          url: `https://api.bilibili.com/x/v2/reply/main?next=0&type=${type}&oid=${oid}&mode=2`,
          responseType: 'json',
          anonymous: true,
          onload: (response) => {
            console.log('Bilibili reply get response:', response.response);
            let replies: Reply[] = response.response.data.replies;
            let found: boolean = false;
            replies.some((reply) => {
              if (reply.rpid === rpid) {
                found = true;
                return true;
              } else {
                return false;
              }
            });
            if (found) {
              alert('🥳评论正常显示');
            } else {
              //带 cookie 获取评论的回复列表，成功就是仅自己可见，已经被删除了就是被系统秒删
              GM_xmlhttpRequest({
                method: 'GET',
                url: `https://api.bilibili.com/x/v2/reply/reply?oid=${oid}&pn=1&ps=10&root=${rpid}&type=1`,
                responseType: 'json',
                onload: (response) => {
                  let respJson = response.response;
                  console.log('Bilibili comment reply get response:', respJson);
                  if (respJson.code == 0) {
                    alert('🤥评论被ShadowBan');
                  } else if (respJson.code == 12022) {
                    alert('🚫评论被系统秒删');
                  }
                }
              });
            }
          }
        });
      }, 3000);
    }
  });
  originalSend.apply(this, [body]);
};