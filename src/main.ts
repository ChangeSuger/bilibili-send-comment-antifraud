import type { Reply, AddReplyResponse, GetReplyResponse } from './types';
import { unsafeWindow } from '$';

const BILIBILI_API = {
  ADD_COMMENT: '//api.bilibili.com/x/v2/reply/add',
  GET_COMMENT: '//api.bilibili.com/x/v2/reply',
  GET_REPLY: '//api.bilibili.com/x/v2/reply/reply',
};

const RESPONSE_CODE = {
  SUCCESS: 0,
  // "已经被删除了"
  DELETED: 12022,
};

const { fetch: originalFetch } = unsafeWindow;

unsafeWindow.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response: Response = await originalFetch(input, init);

  if (String(input).includes(BILIBILI_API.ADD_COMMENT)) {
    // console.log(input, init);
    console.log('Bilibili reply add response:', response);

    const addReplyResponse: AddReplyResponse = await response.clone().json();

    const {rpid, type, root} = addReplyResponse.data.reply;

    // console.log(rpid, type, root);

    const oid = getOid(init?.body as string);

    setTimeout(async () => {
      const response: Response = await fetch(
        root
          ? `${BILIBILI_API.GET_REPLY}?sort=0&type=${type}&root=${root}&oid=${oid}`
          : `${BILIBILI_API.GET_COMMENT}?sort=0&type=${type}&oid=${oid}`
        , {
          method: 'GET',
          credentials: 'same-origin',
          headers: {},
        }
      );

      const getReplyResponse: GetReplyResponse = await response.json();

      console.log('Bilibili reply get response:', getReplyResponse);

      if (findReplyInReplies(rpid, getReplyResponse.data.replies ?? [])) {
        alert('🥳评论正常显示');
      } else {
        const response: Response = await fetch(
          `${BILIBILI_API.GET_REPLY}?oid=${oid}&pn=1&ps=10&root=${rpid}&type=${type}`
          , {
            method: 'GET',
            credentials: 'include',
            headers: {},
          }
        );

        const getReplyResponse: GetReplyResponse = await response.json();

        console.log('Bilibili comment reply get response:', getReplyResponse);

        if (getReplyResponse.code == RESPONSE_CODE.SUCCESS) {
          alert('🤥评论被ShadowBan');
        } else if (getReplyResponse.code == RESPONSE_CODE.DELETED) {
          alert('🚫评论被系统秒删');
        }
      }
    }, 5000);
  }

  return response;
}

// oid 可能超过有 18 位，而 Response 中解析的 Json 的 oid 为 int 类型，会丢精度从而导致获取错误的 oid，这里只能直接从发评论的请求中获取 oid 信息
function getOid(body: string): string {
  const REX_OID = /oid=(?<oid>[0-9]*)&/;
  const match = body.match(REX_OID);
  if (match) {
    return match.groups?.oid || '';
  } else {
    throw new Error('oid not found');
  }
}

function findReplyInReplies(rpid: number, replies: Reply[]): boolean {
  return replies.some(_reply => _reply.rpid === rpid);
}