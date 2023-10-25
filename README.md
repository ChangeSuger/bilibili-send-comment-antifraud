# bilibili-send-comment-antifraud

[哔哩发评反诈](https://github.com/freedom-introvert/biliSendCommAntifraud)的油猴脚本实现

API 参考：[bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect)

## 使用

```bash
pnpm install

pnpm run dev
```

## 开发进度

- [x] 检查新增的评论是否出现在评论列表
- [ ] 新增评论未出现在评论列表时，获取评论的回复列表，根据回复判断是否被 shadowBan

> 本来 API 请求好好的，什么也没改就突然一直 -404 了，怀疑测试时请求过于频繁被 ban 了，有空再推进

## 注意

**请勿滥用，本项目仅用于学习和测试！**
